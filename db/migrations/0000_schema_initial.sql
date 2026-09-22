CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_user_type_key" UNIQUE("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "concert_companions" (
	"concert_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"companion_id" uuid NOT NULL,
	CONSTRAINT "concert_companions_concert_id_companion_id_pk" PRIMARY KEY("concert_id","companion_id"),
	CONSTRAINT "concert_companions_not_self" CHECK ("concert_companions"."companion_id" <> "concert_companions"."owner_id")
);
--> statement-breakpoint
CREATE TABLE "concerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"festival_id" uuid,
	"artist" text NOT NULL,
	"venue" text,
	"city" text,
	"date" date NOT NULL,
	"start_time" time,
	"genre" text,
	"rating_sound" smallint,
	"rating_atmosphere" smallint,
	"rating_setlist" smallint,
	"rating_price" smallint,
	"setlist" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"expectations_before" text,
	"feelings_after" text,
	"cover_image_path" text,
	"photos" text[] DEFAULT '{}'::text[] NOT NULL,
	"ticket_category" text,
	"ticket_reminder_at" timestamp with time zone,
	"ticket_source" text DEFAULT 'manual' NOT NULL,
	"ticket_file_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "concerts_id_user_key" UNIQUE("id","user_id"),
	CONSTRAINT "concerts_rating_sound_range" CHECK ("concerts"."rating_sound" is null or "concerts"."rating_sound" between 1 and 5),
	CONSTRAINT "concerts_rating_atmosphere_range" CHECK ("concerts"."rating_atmosphere" is null or "concerts"."rating_atmosphere" between 1 and 5),
	CONSTRAINT "concerts_rating_setlist_range" CHECK ("concerts"."rating_setlist" is null or "concerts"."rating_setlist" between 1 and 5),
	CONSTRAINT "concerts_rating_price_range" CHECK ("concerts"."rating_price" is null or "concerts"."rating_price" between 1 and 5),
	CONSTRAINT "concerts_ticket_source_allowed" CHECK ("concerts"."ticket_source" in ('manual', 'pdf')),
	CONSTRAINT "concerts_ticket_file_requires_pdf" CHECK ("concerts"."ticket_file_path" is null or "concerts"."ticket_source" = 'pdf')
);
--> statement-breakpoint
CREATE TABLE "festivals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "festivals_id_user_key" UNIQUE("id","user_id"),
	CONSTRAINT "festivals_dates_ordered" CHECK ("festivals"."end_date" >= "festivals"."start_date")
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"requester_id" uuid NOT NULL,
	"addressee_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_requester_id_addressee_id_pk" PRIMARY KEY("requester_id","addressee_id"),
	CONSTRAINT "friendships_status_allowed" CHECK ("friendships"."status" in ('pending', 'accepted')),
	CONSTRAINT "friendships_not_self" CHECK ("friendships"."requester_id" <> "friendships"."addressee_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concert_companions" ADD CONSTRAINT "concert_companions_concert_id_concerts_id_fk" FOREIGN KEY ("concert_id") REFERENCES "public"."concerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concert_companions" ADD CONSTRAINT "concert_companions_companion_id_profiles_id_fk" FOREIGN KEY ("companion_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concert_companions" ADD CONSTRAINT "concert_companions_concert_owner_fk" FOREIGN KEY ("concert_id","owner_id") REFERENCES "public"."concerts"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concerts" ADD CONSTRAINT "concerts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concerts" ADD CONSTRAINT "concerts_festival_same_owner_fk" FOREIGN KEY ("festival_id","user_id") REFERENCES "public"."festivals"("id","user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "festivals" ADD CONSTRAINT "festivals_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_profiles_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_profiles_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;