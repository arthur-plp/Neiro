-- Un compte, un profil — garanti par construction et non par discipline
-- (décision D2). Tout chemin qui crée un compte (magic link, OAuth ajouté
-- plus tard, création depuis l'interface Supabase) produit son profil.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    -- Le nom affiché vient des métadonnées d'inscription quand elles
    -- existent ; sinon on retombe sur la partie locale de l'e-mail, jamais
    -- sur une chaîne vide que la contrainte NOT NULL refuserait.
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Nouveau profil'
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
