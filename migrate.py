"""
migrate.py
──────────
Run once from your project root to add the two new tables
(doctor_profiles, patient_doctor) to the existing hepacheck.db
without touching or dropping any existing data.

Usage:
    python migrate.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "hepacheck.db")


def column_exists(cur, table: str, column: str) -> bool:
    cur.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())


def table_exists(cur, table: str) -> bool:
    cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
    )
    return cur.fetchone() is not None


def run():
    print(f"Connecting to {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # ── 1. Create doctor_profiles table ──────────────────────────────────────
    if not table_exists(cur, "doctor_profiles"):
        print("Creating table: doctor_profiles")
        cur.execute("""
            CREATE TABLE doctor_profiles (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id           INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                medical_licence   VARCHAR NOT NULL,
                highest_degree    VARCHAR NOT NULL,
                specialisation    VARCHAR NOT NULL,
                years_practicing  INTEGER NOT NULL,
                clinic_hospital   VARCHAR,
                city              VARCHAR,
                bio               TEXT,
                is_verified       BOOLEAN NOT NULL DEFAULT 0
            )
        """)
    else:
        print("Table doctor_profiles already exists — skipping creation.")
        # Add any missing columns in case of partial migration
        for col, definition in [
            ("medical_licence",  "VARCHAR NOT NULL DEFAULT ''"),
            ("highest_degree",   "VARCHAR NOT NULL DEFAULT ''"),
            ("specialisation",   "VARCHAR NOT NULL DEFAULT ''"),
            ("years_practicing", "INTEGER NOT NULL DEFAULT 0"),
            ("clinic_hospital",  "VARCHAR"),
            ("city",             "VARCHAR"),
            ("bio",              "TEXT"),
            ("is_verified",      "BOOLEAN NOT NULL DEFAULT 0"),
        ]:
            if not column_exists(cur, "doctor_profiles", col):
                print(f"  Adding column: doctor_profiles.{col}")
                cur.execute(f"ALTER TABLE doctor_profiles ADD COLUMN {col} {definition}")

    # ── 2. Create patient_doctor table ────────────────────────────────────────
    if not table_exists(cur, "patient_doctor"):
        print("Creating table: patient_doctor")
        cur.execute("""
            CREATE TABLE patient_doctor (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id  INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                doctor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                assigned_at DATETIME NOT NULL DEFAULT (datetime('now'))
            )
        """)
    else:
        print("Table patient_doctor already exists — skipping creation.")

    # ── 3. Seed a DoctorProfile for existing doctor accounts ─────────────────
    # Existing doctors (Anjana, Ritu) were registered before this migration
    # and have no profile row. Insert a placeholder so the app doesn't break.
    cur.execute("SELECT id, username FROM users WHERE role='doctor'")
    existing_doctors = cur.fetchall()
    for doc_id, doc_name in existing_doctors:
        cur.execute("SELECT id FROM doctor_profiles WHERE user_id=?", (doc_id,))
        if not cur.fetchone():
            print(f"Inserting placeholder profile for existing doctor: {doc_name} (id={doc_id})")
            cur.execute("""
                INSERT INTO doctor_profiles
                    (user_id, medical_licence, highest_degree, specialisation,
                     years_practicing, clinic_hospital, city, bio, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                doc_id,
                "PENDING",              # medical_licence  — doctor should update
                "MBBS",                 # highest_degree
                "General Medicine",     # specialisation
                0,                      # years_practicing
                "",                     # clinic_hospital
                "",                     # city
                f"Dr. {doc_name}'s profile. Please update via admin.",
                False,                  # is_verified
            ))

    conn.commit()
    conn.close()
    print("\n✅ Migration complete.")
    print("   Existing data untouched.")
    print("   New tables: doctor_profiles, patient_doctor")
    print("\nNext steps:")
    print("  1. Copy the updated Python files into your app/ folder.")
    print("  2. Ask existing doctors to update their profile details.")
    print("  3. Restart uvicorn.")


if __name__ == "__main__":
    run()
