-- Row Level Security : isolation stricte par utilisateur.
--
-- Étape 2 du cahier des charges. Chacun ne voit et ne modifie que ses propres
-- données — y compris quand un ami l'a tagué comme compagnon. L'ouverture aux
-- amis est l'objet de l'étape 6 : il est bien plus sûr d'élargir ensuite que
-- de restreindre après coup.
--
-- `(select auth.uid())` plutôt que `auth.uid()` : la sous-requête est évaluée
-- une fois par requête au lieu d'une fois par ligne.

alter table public.profiles enable row level security;
--> statement-breakpoint
alter table public.festivals enable row level security;
--> statement-breakpoint
alter table public.concerts enable row level security;
--> statement-breakpoint
alter table public.concert_companions enable row level security;
--> statement-breakpoint
alter table public.friendships enable row level security;
--> statement-breakpoint
alter table public.badges enable row level security;
--> statement-breakpoint

-- profiles ------------------------------------------------------------------
-- Pas de politique d'insertion : la ligne est créée par le trigger, qui est
-- `security definer` et ne passe donc pas par la RLS. Pas de suppression non
-- plus : elle vient en cascade de la suppression du compte.

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
--> statement-breakpoint

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
--> statement-breakpoint

-- festivals -----------------------------------------------------------------
-- `using` filtre ce qu'on peut atteindre, `with check` ce qu'on peut écrire.
-- Les deux sur update : sans `with check`, on pourrait modifier une de ses
-- lignes pour en attribuer la propriété à quelqu'un d'autre.

create policy "festivals_select_own"
  on public.festivals for select to authenticated
  using (user_id = (select auth.uid()));
--> statement-breakpoint

create policy "festivals_insert_own"
  on public.festivals for insert to authenticated
  with check (user_id = (select auth.uid()));
--> statement-breakpoint

create policy "festivals_update_own"
  on public.festivals for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
--> statement-breakpoint

create policy "festivals_delete_own"
  on public.festivals for delete to authenticated
  using (user_id = (select auth.uid()));
--> statement-breakpoint

-- concerts ------------------------------------------------------------------

create policy "concerts_select_own"
  on public.concerts for select to authenticated
  using (user_id = (select auth.uid()));
--> statement-breakpoint

create policy "concerts_insert_own"
  on public.concerts for insert to authenticated
  with check (user_id = (select auth.uid()));
--> statement-breakpoint

create policy "concerts_update_own"
  on public.concerts for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
--> statement-breakpoint

create policy "concerts_delete_own"
  on public.concerts for delete to authenticated
  using (user_id = (select auth.uid()));
--> statement-breakpoint

-- concert_companions --------------------------------------------------------
-- `owner_id` est porté par la ligne et lié au concert par clé étrangère
-- composite : la politique n'a donc pas besoin de jointure, et le propriétaire
-- déclaré ne peut pas mentir sur celui du concert.

create policy "concert_companions_select_own"
  on public.concert_companions for select to authenticated
  using (owner_id = (select auth.uid()));
--> statement-breakpoint

create policy "concert_companions_insert_own"
  on public.concert_companions for insert to authenticated
  with check (owner_id = (select auth.uid()));
--> statement-breakpoint

create policy "concert_companions_delete_own"
  on public.concert_companions for delete to authenticated
  using (owner_id = (select auth.uid()));
--> statement-breakpoint

-- friendships ---------------------------------------------------------------
-- Le seul endroit où deux utilisateurs voient la même ligne, parce qu'un lien
-- d'amitié n'appartient à personne seul.

create policy "friendships_select_involved"
  on public.friendships for select to authenticated
  using (
    requester_id = (select auth.uid())
    or addressee_id = (select auth.uid())
  );
--> statement-breakpoint

-- On n'envoie que ses propres demandes, et toujours en attente.
create policy "friendships_insert_as_requester"
  on public.friendships for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and status = 'pending'
  );
--> statement-breakpoint

-- Seul le destinataire accepte : un demandeur ne peut pas valider sa propre
-- demande.
create policy "friendships_accept_as_addressee"
  on public.friendships for update to authenticated
  using (addressee_id = (select auth.uid()))
  with check (
    addressee_id = (select auth.uid())
    and status = 'accepted'
  );
--> statement-breakpoint

-- Chacune des deux parties peut rompre le lien ou annuler la demande.
create policy "friendships_delete_involved"
  on public.friendships for delete to authenticated
  using (
    requester_id = (select auth.uid())
    or addressee_id = (select auth.uid())
  );
--> statement-breakpoint

-- badges --------------------------------------------------------------------
-- Lecture seule côté client : les badges seront attribués à l'étape 7 par une
-- Edge Function, pas par l'utilisateur lui-même. Aucune politique d'insertion,
-- de modification ou de suppression n'est donc définie ici, ce qui les
-- interdit toutes.

create policy "badges_select_own"
  on public.badges for select to authenticated
  using (user_id = (select auth.uid()));
