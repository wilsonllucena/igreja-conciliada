-- Criar o tenant que está faltando
INSERT INTO tenants (id, name, slug, created_at, updated_at)
VALUES (
  '093e34fd-c861-465f-8796-44386f82d584',
  'Igreja Padrão', 
  'igreja-padrao',
  now(),
  now()
);