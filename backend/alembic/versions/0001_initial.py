"""Initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('google_id', sa.String(255), nullable=True, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('profile_photo_url', sa.String(500), nullable=True),
        sa.Column('bio', sa.String(1000), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('skills', sa.String(2000), nullable=True),
        sa.Column('fcm_token', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_employer', sa.Boolean(), default=False),
        sa.Column('is_admin', sa.Boolean(), default=False),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE taskstatus AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('employer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('location', sa.String(255), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('pay_rate_per_minute', sa.Float(), nullable=False),
        sa.Column('estimated_duration_minutes', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('status', sa.Enum('open', 'in_progress', 'completed', 'cancelled', name='taskstatus', create_type=False), nullable=False, server_default='open'),
        sa.Column('max_applicants', sa.Integer(), default=1),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE applicationstatus AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    op.create_table(
        'applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('worker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('cover_note', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'withdrawn', name='applicationstatus', create_type=False), nullable=False, server_default='pending'),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('applications')
    op.drop_table('tasks')
    op.drop_table('users')
    op.execute(sa.text("DROP TYPE IF EXISTS applicationstatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS taskstatus"))
