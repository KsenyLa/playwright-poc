INSERT INTO warehouses (id, name, description)
VALUES
  ('wh-seed-1', 'North Hub', 'Primary northern distribution center'),
  ('wh-seed-2', 'South Hub', 'Backup warehouse for southern region')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, price)
VALUES
  ('pr-seed-1', 'Safety Helmet', 49.90),
  ('pr-seed-2', 'Industrial Gloves', 12.50),
  ('pr-seed-3', 'Steel Boots', 89.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, product_id, warehouse_id, amount)
VALUES
  ('pos-seed-1', 'pr-seed-1', 'wh-seed-1', 25),
  ('pos-seed-2', 'pr-seed-2', 'wh-seed-1', 80),
  ('pos-seed-3', 'pr-seed-3', 'wh-seed-2', 40)
ON CONFLICT (id) DO NOTHING;
