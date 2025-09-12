-- SQL example (PostgreSQL) for the portal patch
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'default',
  cols int NOT NULL DEFAULT 12,
  row_height int NOT NULL DEFAULT 90,
  gap int NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_layouts_tenant_user_name
  ON dashboard_layouts (tenant_id, user_id, name);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY,
  layout_id uuid NOT NULL REFERENCES dashboard_layouts(id) ON DELETE CASCADE,
  key text NOT NULL,
  x int NOT NULL,
  y int NOT NULL,
  w int NOT NULL,
  h int NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dashboard_widgets_layout_yx
  ON dashboard_widgets (layout_id, y, x);
