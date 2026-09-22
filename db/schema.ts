import { sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  pgSchema,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Supabase Auth possède ses propres comptes dans le schéma `auth`.
 * On le déclare ici uniquement pour pouvoir exprimer la clé étrangère :
 * Drizzle ne gère pas ce schéma, il ne fait que le référencer.
 */
const authSchema = pgSchema("auth");
const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

/**
 * Un compte, un profil. L'identifiant est celui du compte d'authentification
 * pour qu'aucune correspondance parallèle ne puisse diverger. La ligne est
 * créée par un trigger sur `auth.users`, jamais par le code applicatif
 * (décision D2).
 */
export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Un festival appartient à un utilisateur : deux amis au même festival réel
 * possèdent chacun leur ligne (décision D6). La contrainte d'unicité sur
 * (id, user_id) est ce qui permet à `concerts` de garantir par clé étrangère
 * qu'on ne rattache pas un concert au festival d'autrui.
 */
export const festivals = pgTable(
  "festivals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    city: text("city"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("festivals_id_user_key").on(t.id, t.userId),
    check("festivals_dates_ordered", sql`${t.endDate} >= ${t.startDate}`),
  ],
);

/**
 * L'entité centrale. Le billet y est fusionné (écart 1 du proposal) et le
 * statut « à venir / passé » n'est pas stocké : il se déduit de `date`.
 *
 * Chaque artiste vu pendant un festival donne un concert distinct rattaché
 * au festival parent, pour qu'un week-end compte autant de lignes que de sets
 * dans le classement et les statistiques.
 */
export const concerts = pgTable(
  "concerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    festivalId: uuid("festival_id"),

    artist: text("artist").notNull(),
    venue: text("venue"),
    city: text("city"),
    date: date("date").notNull(),
    startTime: time("start_time"),
    genre: text("genre"),

    ratingSound: smallint("rating_sound"),
    ratingAtmosphere: smallint("rating_atmosphere"),
    ratingSetlist: smallint("rating_setlist"),
    ratingPrice: smallint("rating_price"),

    setlist: text("setlist").array().notNull().default(sql`'{}'::text[]`),
    notes: text("notes"),
    expectationsBefore: text("expectations_before"),
    feelingsAfter: text("feelings_after"),

    coverImagePath: text("cover_image_path"),
    photos: text("photos").array().notNull().default(sql`'{}'::text[]`),

    ticketCategory: text("ticket_category"),
    ticketReminderAt: timestamp("ticket_reminder_at", { withTimezone: true }),
    ticketSource: text("ticket_source").notNull().default("manual"),
    ticketFilePath: text("ticket_file_path"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Permet à concert_companions de vérifier par clé étrangère que le
    // taggeur est bien le propriétaire du concert.
    unique("concerts_id_user_key").on(t.id, t.userId),

    // Un concert ne peut être rattaché qu'à un festival du même utilisateur.
    foreignKey({
      name: "concerts_festival_same_owner_fk",
      columns: [t.festivalId, t.userId],
      foreignColumns: [festivals.id, festivals.userId],
    }).onDelete("set null"),

    // Les quatre notes sont indépendantes et facultatives ; une note
    // renseignée vaut de 1 à 5. Rejeté par la base, pas seulement par Zod
    // (décision D5).
    check(
      "concerts_rating_sound_range",
      sql`${t.ratingSound} is null or ${t.ratingSound} between 1 and 5`,
    ),
    check(
      "concerts_rating_atmosphere_range",
      sql`${t.ratingAtmosphere} is null or ${t.ratingAtmosphere} between 1 and 5`,
    ),
    check(
      "concerts_rating_setlist_range",
      sql`${t.ratingSetlist} is null or ${t.ratingSetlist} between 1 and 5`,
    ),
    check(
      "concerts_rating_price_range",
      sql`${t.ratingPrice} is null or ${t.ratingPrice} between 1 and 5`,
    ),

    check(
      "concerts_ticket_source_allowed",
      sql`${t.ticketSource} in ('manual', 'pdf')`,
    ),
    // Un billet saisi manuellement n'a pas de fichier.
    check(
      "concerts_ticket_file_requires_pdf",
      sql`${t.ticketFilePath} is null or ${t.ticketSource} = 'pdf'`,
    ),
  ],
);

/**
 * Les amis tagués comme présents. `owner_id` est porté par la ligne, ce qui
 * permet à la fois d'interdire l'auto-tag par une contrainte simple et de
 * poser une politique RLS sans jointure (écart 4 du proposal).
 */
export const concertCompanions = pgTable(
  "concert_companions",
  {
    concertId: uuid("concert_id")
      .notNull()
      .references(() => concerts.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    companionId: uuid("companion_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.concertId, t.companionId] }),
    foreignKey({
      name: "concert_companions_concert_owner_fk",
      columns: [t.concertId, t.ownerId],
      foreignColumns: [concerts.id, concerts.userId],
    }).onDelete("cascade"),
    check(
      "concert_companions_not_self",
      sql`${t.companionId} <> ${t.ownerId}`,
    ),
  ],
);

/**
 * Lien dirigé : le demandeur et le destinataire ne sont pas interchangeables,
 * car seul le destinataire peut accepter.
 */
export const friendships = pgTable(
  "friendships",
  {
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.requesterId, t.addresseeId] }),
    check(
      "friendships_status_allowed",
      sql`${t.status} in ('pending', 'accepted')`,
    ),
    check("friendships_not_self", sql`${t.requesterId} <> ${t.addresseeId}`),
  ],
);

/**
 * Un badge non obtenu n'existe pas : l'absence de ligne vaut verrouillage.
 * Rempli à l'étape 7, la table existe dès maintenant pour que sa RLS soit
 * posée en même temps que les autres.
 */
export const badges = pgTable(
  "badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("badges_user_type_key").on(t.userId, t.type)],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Festival = typeof festivals.$inferSelect;
export type NewFestival = typeof festivals.$inferInsert;
export type Concert = typeof concerts.$inferSelect;
export type NewConcert = typeof concerts.$inferInsert;
export type ConcertCompanion = typeof concertCompanions.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type Badge = typeof badges.$inferSelect;
