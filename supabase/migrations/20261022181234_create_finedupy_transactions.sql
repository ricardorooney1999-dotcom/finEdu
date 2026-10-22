/*
# Create FINEDUPY transactions table

1. New Tables
- `finedupy_transactions` stores income and expense entries used by the dashboard.
- `id` (uuid, primary key) uniquely identifies each movement.
- `kind` (text) is either income or expense.
- `description` (text) contains the user-facing label.
- `category` (text) groups the movement for budgets and charts.
- `amount` (numeric) stores whole Guaraní amounts.
- `occurred_on` (date) stores the movement date.
- `created_at` (timestamptz) stores insertion time.

2. Security
- Row Level Security is enabled.
- This prototype has no sign-in screen, so the shared demo workspace is intentionally readable and writable by anon and authenticated roles.
- Grants are limited to the CRUD verbs used by the application.

3. Important Notes
- Monetary values are stored as numeric values in Guaraníes and formatted in the interface.
- The table is intentionally single-tenant for the MVP prototype.
*/

CREATE TABLE IF NOT EXISTS public.finedupy_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('income', 'expense')),
  description text NOT NULL,
  category text NOT NULL,
  amount numeric(14, 0) NOT NULL CHECK (amount > 0),
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finedupy_transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finedupy_transactions TO anon, authenticated;

DROP POLICY IF EXISTS "shared_read_finedupy_transactions" ON public.finedupy_transactions;
CREATE POLICY "shared_read_finedupy_transactions"
  ON public.finedupy_transactions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "shared_insert_finedupy_transactions" ON public.finedupy_transactions;
CREATE POLICY "shared_insert_finedupy_transactions"
  ON public.finedupy_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "shared_update_finedupy_transactions" ON public.finedupy_transactions;
CREATE POLICY "shared_update_finedupy_transactions"
  ON public.finedupy_transactions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "shared_delete_finedupy_transactions" ON public.finedupy_transactions;
CREATE POLICY "shared_delete_finedupy_transactions"
  ON public.finedupy_transactions FOR DELETE
  TO anon, authenticated
  USING (true);