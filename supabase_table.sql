-- ============================================================
-- CTRM Supervisor Assessment — Supabase Table Definition
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Step 1: drop old table (if it exists)
-- Step 2: run this script
-- ============================================================

drop table if exists assessments;

create table assessments (

  -- ── System (auto-filled) ────────────────────────────────────
  id            uuid        primary key default gen_random_uuid(),
  submitted_at  timestamptz not null    default now(),

  -- ── Candidate Info ──────────────────────────────────────────
  candidate_name   text not null,
  employee_no      text not null,
  department       text not null,
  supervisor_name  text not null,
  assessment_date  date not null,

  -- ── SECTION 1: FLEXTIVITY (weight 40%) ─────────────────────
  -- Score: 1=Lemah  2=Memadai  3=Baik  4=Cemerlang
  f01_adaptasi_tugasan_score        smallint check (f01_adaptasi_tugasan_score        between 1 and 4),
  f01_adaptasi_tugasan_comment      text,

  f02_fleksibiliti_masa_score       smallint check (f02_fleksibiliti_masa_score       between 1 and 4),
  f02_fleksibiliti_masa_comment     text,

  f03_multi_tugas_score             smallint check (f03_multi_tugas_score             between 1 and 4),
  f03_multi_tugas_comment           text,

  f04_penyelesaian_masalah_score    smallint check (f04_penyelesaian_masalah_score    between 1 and 4),
  f04_penyelesaian_masalah_comment  text,

  f05_kemahiran_bersilang_score     smallint check (f05_kemahiran_bersilang_score     between 1 and 4),
  f05_kemahiran_bersilang_comment   text,

  f06_keupayaan_digital_score       smallint check (f06_keupayaan_digital_score       between 1 and 4),
  f06_keupayaan_digital_comment     text,

  f07_reskilling_upskilling_score   smallint check (f07_reskilling_upskilling_score   between 1 and 4),
  f07_reskilling_upskilling_comment text,

  f08_kesediaan_berubah_score       smallint check (f08_kesediaan_berubah_score       between 1 and 4),
  f08_kesediaan_berubah_comment     text,

  f09_ketahanan_score               smallint check (f09_ketahanan_score               between 1 and 4),
  f09_ketahanan_comment             text,

  f10_mobiliti_kerja_score          smallint check (f10_mobiliti_kerja_score          between 1 and 4),
  f10_mobiliti_kerja_comment        text,

  -- ── SECTION 2: PRODUCTIVITY PQCDSM (weight 40%) ────────────
  p_kuantiti_kecekapan_score        smallint check (p_kuantiti_kecekapan_score        between 1 and 4),
  p_kuantiti_kecekapan_comment      text,

  q_kualiti_hasil_score             smallint check (q_kualiti_hasil_score             between 1 and 4),
  q_kualiti_hasil_comment           text,

  c_penjimatan_kos_score            smallint check (c_penjimatan_kos_score            between 1 and 4),
  c_penjimatan_kos_comment          text,

  d_pematuhan_masa_score            smallint check (d_pematuhan_masa_score            between 1 and 4),
  d_pematuhan_masa_comment          text,

  s_amalan_keselamatan_score        smallint check (s_amalan_keselamatan_score        between 1 and 4),
  s_amalan_keselamatan_comment      text,

  m_semangat_kaizen_score           smallint check (m_semangat_kaizen_score           between 1 and 4),
  m_semangat_kaizen_comment         text,

  -- ── SECTION 3: MORAL & PROFESIONALISME (weight 20%) ────────
  mo1_tingkah_laku_profesional_score    smallint check (mo1_tingkah_laku_profesional_score    between 1 and 4),
  mo1_tingkah_laku_profesional_comment  text,

  mo2_komunikasi_beretika_score         smallint check (mo2_komunikasi_beretika_score         between 1 and 4),
  mo2_komunikasi_beretika_comment       text,

  mo3_integriti_score                   smallint check (mo3_integriti_score                   between 1 and 4),
  mo3_integriti_comment                 text,

  mo4_disiplin_kehadiran_score          smallint check (mo4_disiplin_kehadiran_score          between 1 and 4),
  mo4_disiplin_kehadiran_comment        text,

  mo5_pematuhan_budaya_kerja_score      smallint check (mo5_pematuhan_budaya_kerja_score      between 1 and 4),
  mo5_pematuhan_budaya_kerja_comment    text,

  -- ── Result ──────────────────────────────────────────────────
  weighted_score  numeric(5, 2),   -- e.g. 87.50
  recommendation  text,
  remarks         text

);

-- ── Row-Level Security ──────────────────────────────────────
alter table assessments enable row level security;

-- App (anon key) can insert
create policy "Allow anon insert"
  on assessments for insert
  to anon
  with check (true);

-- Admin (authenticated) can read all rows
create policy "Allow authenticated read"
  on assessments for select
  to authenticated
  using (true);
