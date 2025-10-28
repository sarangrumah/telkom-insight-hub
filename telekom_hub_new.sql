--
-- PostgreSQL database dump
--

\restrict MZPRZdjqiLcHhQTxjMcOD20EwLCLU8w1OL0RyRVyQ6KGZFWCUmsmh5yR4d1MoPe

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-15 01:35:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 32 (class 2615 OID 16492)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- TOC entry 14 (class 2615 OID 16388)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- TOC entry 17 (class 2615 OID 16622)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- TOC entry 16 (class 2615 OID 16611)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- TOC entry 12 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- TOC entry 9 (class 2615 OID 16603)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- TOC entry 33 (class 2615 OID 16540)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- TOC entry 11 (class 2615 OID 17268)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- TOC entry 15 (class 2615 OID 16651)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- TOC entry 6 (class 3079 OID 16687)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 4768 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 4 (class 3079 OID 16389)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 4769 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 2 (class 3079 OID 16441)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 4770 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 5 (class 3079 OID 16652)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 4771 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 3 (class 3079 OID 16430)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 4772 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1120 (class 1247 OID 16780)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- TOC entry 1144 (class 1247 OID 16921)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- TOC entry 1117 (class 1247 OID 16774)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1114 (class 1247 OID 16769)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1273 (class 1247 OID 49483)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1150 (class 1247 OID 16963)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1210 (class 1247 OID 17279)
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'internal_admin',
    'pelaku_usaha',
    'pengolah_data',
    'internal_group',
    'guest'
);


ALTER TYPE public.app_role OWNER TO postgres;

--
-- TOC entry 1306 (class 1247 OID 45880)
-- Name: application_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.application_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'need_correction',
    'approved',
    'rejected',
    'disposisi_ketua',
    'evaluasi_evaluator',
    'evaluasi_wakil_ketua',
    'evaluasi_ketua',
    'uji_laik_operasi',
    'completed'
);


ALTER TYPE public.application_status OWNER TO postgres;

--
-- TOC entry 1246 (class 1247 OID 17594)
-- Name: assignment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assignment_status AS ENUM (
    'unassigned',
    'assigned',
    'in_review',
    'escalated'
);


ALTER TYPE public.assignment_status OWNER TO postgres;

--
-- TOC entry 1309 (class 1247 OID 45906)
-- Name: company_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_status AS ENUM (
    'pending_verification',
    'verified',
    'rejected',
    'suspended',
    'needs_correction'
);


ALTER TYPE public.company_status OWNER TO postgres;

--
-- TOC entry 1327 (class 1247 OID 57366)
-- Name: company_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_type AS ENUM (
    'pt',
    'cv',
    'ud',
    'koperasi',
    'yayasan',
    'other'
);


ALTER TYPE public.company_type OWNER TO postgres;

--
-- TOC entry 1363 (class 1247 OID 58627)
-- Name: correction_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.correction_status AS ENUM (
    'pending_correction',
    'corrected'
);


ALTER TYPE public.correction_status OWNER TO postgres;

--
-- TOC entry 1324 (class 1247 OID 57354)
-- Name: document_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_type AS ENUM (
    'nib',
    'npwp',
    'akta',
    'ktp',
    'assignment_letter'
);


ALTER TYPE public.document_type OWNER TO postgres;

--
-- TOC entry 1303 (class 1247 OID 45872)
-- Name: license_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.license_type AS ENUM (
    'jasa_telekomunikasi',
    'jaringan_telekomunikasi',
    'penomoran_telekomunikasi'
);


ALTER TYPE public.license_type OWNER TO postgres;

--
-- TOC entry 1213 (class 1247 OID 17292)
-- Name: service_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_type AS ENUM (
    'jasa',
    'jaringan',
    'telekomunikasi_khusus',
    'isr',
    'tarif',
    'sklo',
    'lko'
);


ALTER TYPE public.service_type OWNER TO postgres;

--
-- TOC entry 1312 (class 1247 OID 45916)
-- Name: test_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.test_method AS ENUM (
    'uji_petik',
    'mandiri'
);


ALTER TYPE public.test_method OWNER TO postgres;

--
-- TOC entry 1243 (class 1247 OID 17580)
-- Name: ticket_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_category AS ENUM (
    'technical',
    'billing',
    'general',
    'data_request',
    'account',
    'other'
);


ALTER TYPE public.ticket_category OWNER TO postgres;

--
-- TOC entry 1300 (class 1247 OID 45857)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'pelaku_usaha',
    'ketua_tim',
    'evaluator',
    'wakil_ketua',
    'direktur',
    'verifikator_nib',
    'admin',
    'superadmin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 1168 (class 1247 OID 17046)
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- TOC entry 1159 (class 1247 OID 17006)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- TOC entry 1162 (class 1247 OID 17021)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- TOC entry 1174 (class 1247 OID 17088)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- TOC entry 1171 (class 1247 OID 17059)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- TOC entry 1234 (class 1247 OID 17532)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- TOC entry 389 (class 1255 OID 16538)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- TOC entry 4773 (class 0 OID 0)
-- Dependencies: 389
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 408 (class 1255 OID 16751)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- TOC entry 388 (class 1255 OID 16537)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- TOC entry 4776 (class 0 OID 0)
-- Dependencies: 388
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 387 (class 1255 OID 16536)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- TOC entry 4778 (class 0 OID 0)
-- Dependencies: 387
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 390 (class 1255 OID 16595)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- TOC entry 4794 (class 0 OID 0)
-- Dependencies: 390
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 394 (class 1255 OID 16616)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- TOC entry 4796 (class 0 OID 0)
-- Dependencies: 394
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 391 (class 1255 OID 16597)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- TOC entry 4798 (class 0 OID 0)
-- Dependencies: 391
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 392 (class 1255 OID 16607)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- TOC entry 393 (class 1255 OID 16608)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- TOC entry 395 (class 1255 OID 16618)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- TOC entry 4827 (class 0 OID 0)
-- Dependencies: 395
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 337 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- TOC entry 454 (class 1255 OID 57516)
-- Name: approve_company(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.approve_company(_company_id uuid, _verified_by uuid, _notes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if user has permission to approve companies
  IF NOT (has_role(_verified_by, 'super_admin') OR has_role(_verified_by, 'internal_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to approve companies';
  END IF;

  -- Update company status to verified
  UPDATE public.companies
  SET 
    status = 'verified',
    verified_at = now(),
    verified_by = _verified_by,
    verification_notes = _notes,
    updated_at = now()
  WHERE id = _company_id;

  -- Update associated user profiles to validated status
  UPDATE public.profiles
  SET 
    is_validated = true,
    updated_at = now()
  WHERE user_id IN (
    SELECT up.user_id 
    FROM user_profiles up 
    WHERE up.company_id = _company_id
  );
END;
$$;


ALTER FUNCTION public.approve_company(_company_id uuid, _verified_by uuid, _notes text) OWNER TO postgres;

--
-- TOC entry 447 (class 1255 OID 17655)
-- Name: calculate_sla_metrics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_sla_metrics() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  ticket_created_at TIMESTAMP WITH TIME ZONE;
  first_admin_response TIMESTAMP WITH TIME ZONE;
  ticket_resolved_at TIMESTAMP WITH TIME ZONE;
  response_time_minutes INTEGER;
  resolution_time_minutes INTEGER;
  sla_response_target INTEGER := 240; -- 4 hours
  sla_resolution_target INTEGER := 1440; -- 24 hours
BEGIN
  -- Get ticket creation time
  SELECT created_at INTO ticket_created_at 
  FROM public.tickets 
  WHERE id = NEW.ticket_id;
  
  -- Get first admin response time
  SELECT MIN(created_at) INTO first_admin_response
  FROM public.ticket_messages 
  WHERE ticket_id = NEW.ticket_id AND is_admin_message = true;
  
  -- Get resolution time if ticket is resolved
  SELECT resolved_at INTO ticket_resolved_at
  FROM public.tickets 
  WHERE id = NEW.ticket_id AND status IN ('resolved', 'closed');
  
  -- Calculate response time in minutes
  IF first_admin_response IS NOT NULL THEN
    response_time_minutes := EXTRACT(EPOCH FROM (first_admin_response - ticket_created_at)) / 60;
  END IF;
  
  -- Calculate resolution time in minutes
  IF ticket_resolved_at IS NOT NULL THEN
    resolution_time_minutes := EXTRACT(EPOCH FROM (ticket_resolved_at - ticket_created_at)) / 60;
  END IF;
  
  -- Adjust SLA targets based on priority
  SELECT CASE 
    WHEN priority = 'high' THEN 120    -- 2 hours for high priority
    WHEN priority = 'medium' THEN 240  -- 4 hours for medium priority
    WHEN priority = 'low' THEN 480     -- 8 hours for low priority
    ELSE 240
  END INTO sla_response_target
  FROM public.tickets WHERE id = NEW.ticket_id;
  
  SELECT CASE 
    WHEN priority = 'high' THEN 720    -- 12 hours for high priority
    WHEN priority = 'medium' THEN 1440 -- 24 hours for medium priority
    WHEN priority = 'low' THEN 2880    -- 48 hours for low priority
    ELSE 1440
  END INTO sla_resolution_target
  FROM public.tickets WHERE id = NEW.ticket_id;
  
  -- Insert or update SLA metrics
  INSERT INTO public.ticket_sla_metrics (
    ticket_id,
    first_response_time_minutes,
    resolution_time_minutes,
    sla_target_response_minutes,
    sla_target_resolution_minutes,
    response_sla_met,
    resolution_sla_met
  ) VALUES (
    NEW.ticket_id,
    response_time_minutes,
    resolution_time_minutes,
    sla_response_target,
    sla_resolution_target,
    CASE WHEN response_time_minutes IS NULL THEN NULL 
         ELSE response_time_minutes <= sla_response_target END,
    CASE WHEN resolution_time_minutes IS NULL THEN NULL 
         ELSE resolution_time_minutes <= sla_resolution_target END
  )
  ON CONFLICT (ticket_id) DO UPDATE SET
    first_response_time_minutes = EXCLUDED.first_response_time_minutes,
    resolution_time_minutes = EXCLUDED.resolution_time_minutes,
    sla_target_response_minutes = EXCLUDED.sla_target_response_minutes,
    sla_target_resolution_minutes = EXCLUDED.sla_target_resolution_minutes,
    response_sla_met = EXCLUDED.response_sla_met,
    resolution_sla_met = EXCLUDED.resolution_sla_met,
    updated_at = now();
    
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.calculate_sla_metrics() OWNER TO postgres;

--
-- TOC entry 451 (class 1255 OID 31342)
-- Name: check_record_permission(uuid, text, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_record_permission(_user_id uuid, _table_name text, _record_id uuid, _action text) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.record_permissions
    WHERE user_id = _user_id
      AND table_name = _table_name
      AND record_id = _record_id
      AND permission_type = _action
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;


ALTER FUNCTION public.check_record_permission(_user_id uuid, _table_name text, _record_id uuid, _action text) OWNER TO postgres;

--
-- TOC entry 450 (class 1255 OID 31341)
-- Name: check_user_permission(uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_user_permission(_user_id uuid, _module_code text, _action text, _field_code text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _user_roles app_role[];
  _has_permission BOOLEAN := false;
  _permission_record permissions%ROWTYPE;
BEGIN
  -- Get all roles for the user
  SELECT ARRAY_AGG(role) INTO _user_roles
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- If no roles, return false
  IF _user_roles IS NULL OR array_length(_user_roles, 1) = 0 THEN
    RETURN false;
  END IF;
  
  -- Check for module-level permission
  FOR _permission_record IN
    SELECT p.*
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    WHERE m.code = _module_code
      AND p.role = ANY(_user_roles)
      AND (_field_code IS NULL OR p.field_id IS NULL)
  LOOP
    CASE _action
      WHEN 'create' THEN _has_permission := _permission_record.can_create;
      WHEN 'read' THEN _has_permission := _permission_record.can_read;
      WHEN 'update' THEN _has_permission := _permission_record.can_update;
      WHEN 'delete' THEN _has_permission := _permission_record.can_delete;
      ELSE _has_permission := false;
    END CASE;
    
    -- If permission found, return true
    IF _has_permission THEN
      RETURN true;
    END IF;
  END LOOP;
  
  -- Check field-level permission if field_code provided
  IF _field_code IS NOT NULL THEN
    FOR _permission_record IN
      SELECT p.*
      FROM public.permissions p
      JOIN public.modules m ON p.module_id = m.id
      JOIN public.fields f ON p.field_id = f.id
      WHERE m.code = _module_code
        AND f.code = _field_code
        AND p.role = ANY(_user_roles)
    LOOP
      CASE _action
        WHEN 'create' THEN _has_permission := _permission_record.can_create;
        WHEN 'read' THEN _has_permission := _permission_record.can_read;
        WHEN 'update' THEN _has_permission := _permission_record.can_update;
        WHEN 'delete' THEN _has_permission := _permission_record.can_delete;
        ELSE _has_permission := false;
      END CASE;
      
      IF _has_permission THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;
  
  RETURN false;
END;
$$;


ALTER FUNCTION public.check_user_permission(_user_id uuid, _module_code text, _action text, _field_code text) OWNER TO postgres;

--
-- TOC entry 448 (class 1255 OID 17658)
-- Name: escalate_overdue_tickets(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.escalate_overdue_tickets() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Escalate tickets that haven't received first response within SLA
  UPDATE public.tickets 
  SET 
    priority = CASE 
      WHEN priority = 'low' THEN 'medium'
      WHEN priority = 'medium' THEN 'high'
      ELSE priority
    END,
    escalation_level = escalation_level + 1,
    escalated_at = now()
  WHERE 
    status NOT IN ('resolved', 'closed')
    AND created_at < now() - INTERVAL '4 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.ticket_messages 
      WHERE ticket_id = tickets.id AND is_admin_message = true
    );
    
  -- Escalate high priority tickets that are still open after 8 hours
  UPDATE public.tickets 
  SET 
    escalation_level = escalation_level + 1,
    escalated_at = now()
  WHERE 
    priority = 'high'
    AND status NOT IN ('resolved', 'closed')
    AND created_at < now() - INTERVAL '8 hours'
    AND escalation_level = 0;
END;
$$;


ALTER FUNCTION public.escalate_overdue_tickets() OWNER TO postgres;

--
-- TOC entry 456 (class 1255 OID 57518)
-- Name: get_companies_for_management(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_companies_for_management() RETURNS TABLE(company_id uuid, company_name text, email text, phone text, nib_number text, npwp_number text, akta_number text, status public.company_status, created_at timestamp with time zone, verified_at timestamp with time zone, verified_by uuid, verification_notes text, verifier_name text, pic_count bigint, document_count bigint)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as company_id,
    c.company_name,
    c.email,
    c.phone,
    c.nib_number,
    c.npwp_number,
    c.akta_number,
    c.status,
    c.created_at,
    c.verified_at,
    c.verified_by,
    c.verification_notes,
    p.full_name as verifier_name,
    COALESCE(pic_counts.pic_count, 0) as pic_count,
    COALESCE(doc_counts.document_count, 0) as document_count
  FROM public.companies c
  LEFT JOIN public.profiles p ON c.verified_by = p.user_id
  LEFT JOIN (
    SELECT pic.company_id, COUNT(*) as pic_count
    FROM public.person_in_charge pic
    GROUP BY pic.company_id
  ) pic_counts ON c.id = pic_counts.company_id
  LEFT JOIN (
    SELECT cd.company_id, COUNT(*) as document_count
    FROM public.company_documents cd
    GROUP BY cd.company_id
  ) doc_counts ON c.id = doc_counts.company_id
  ORDER BY 
    CASE c.status 
      WHEN 'pending_verification' THEN 1
      WHEN 'verified' THEN 2
      WHEN 'rejected' THEN 3
      ELSE 4
    END,
    c.created_at DESC;
END;
$$;


ALTER FUNCTION public.get_companies_for_management() OWNER TO postgres;

--
-- TOC entry 452 (class 1255 OID 31343)
-- Name: get_user_permissions(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_permissions(_user_id uuid, _module_code text DEFAULT NULL::text) RETURNS TABLE(module_code text, module_name text, field_code text, field_name text, can_create boolean, can_read boolean, can_update boolean, can_delete boolean, field_access text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _user_roles app_role[];
BEGIN
  -- Get all roles for the user
  SELECT ARRAY_AGG(role) INTO _user_roles
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Return permissions for user's roles
  RETURN QUERY
  SELECT 
    m.code as module_code,
    m.name as module_name,
    COALESCE(f.code, '') as field_code,
    COALESCE(f.name, '') as field_name,
    p.can_create,
    p.can_read,
    p.can_update,
    p.can_delete,
    p.field_access
  FROM public.permissions p
  JOIN public.modules m ON p.module_id = m.id
  LEFT JOIN public.fields f ON p.field_id = f.id
  WHERE p.role = ANY(_user_roles)
    AND (_module_code IS NULL OR m.code = _module_code)
    AND m.is_active = true
    AND (f.id IS NULL OR f.is_active = true)
  ORDER BY m.code, f.code;
END;
$$;


ALTER FUNCTION public.get_user_permissions(_user_id uuid, _module_code text) OWNER TO postgres;

--
-- TOC entry 431 (class 1255 OID 17420)
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  
  -- Set default role to pelaku_usaha for registered users (not guest)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pelaku_usaha');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- TOC entry 430 (class 1255 OID 17402)
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


ALTER FUNCTION public.has_role(_user_id uuid, _role public.app_role) OWNER TO postgres;

--
-- TOC entry 449 (class 1255 OID 18925)
-- Name: log_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_changes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.log_changes() OWNER TO postgres;

--
-- TOC entry 455 (class 1255 OID 57517)
-- Name: reject_company(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reject_company(_company_id uuid, _rejected_by uuid, _rejection_notes text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if user has permission to reject companies
  IF NOT (has_role(_rejected_by, 'super_admin') OR has_role(_rejected_by, 'internal_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to reject companies';
  END IF;

  -- Update company status to rejected
  UPDATE public.companies
  SET 
    status = 'rejected',
    verified_by = _rejected_by,
    verification_notes = _rejection_notes,
    updated_at = now()
  WHERE id = _company_id;
END;
$$;


ALTER FUNCTION public.reject_company(_company_id uuid, _rejected_by uuid, _rejection_notes text) OWNER TO postgres;

--
-- TOC entry 457 (class 1255 OID 58633)
-- Name: request_company_correction(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.request_company_correction(_company_id uuid, _requested_by uuid, _correction_notes jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if user has permission to request corrections
  IF NOT (has_role(_requested_by, 'super_admin'::app_role) OR has_role(_requested_by, 'internal_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient permissions to request corrections';
  END IF;

  -- Update company status to needs correction
  UPDATE public.companies
  SET 
    status = 'needs_correction',
    correction_notes = _correction_notes,
    correction_status = 'pending_correction',
    updated_at = now()
  WHERE id = _company_id;
END;
$$;


ALTER FUNCTION public.request_company_correction(_company_id uuid, _requested_by uuid, _correction_notes jsonb) OWNER TO postgres;

--
-- TOC entry 458 (class 1255 OID 58634)
-- Name: submit_company_corrections(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.submit_company_corrections(_company_id uuid, _submitted_by uuid, _updated_data jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if user belongs to the company
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = _submitted_by AND company_id = _company_id
  ) THEN
    RAISE EXCEPTION 'User does not belong to this company';
  END IF;

  -- Update company status back to pending verification
  UPDATE public.companies
  SET 
    status = 'pending_verification',
    correction_status = 'corrected',
    updated_at = now()
  WHERE id = _company_id AND status = 'needs_correction';
END;
$$;


ALTER FUNCTION public.submit_company_corrections(_company_id uuid, _submitted_by uuid, _updated_data jsonb) OWNER TO postgres;

--
-- TOC entry 432 (class 1255 OID 17422)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- TOC entry 453 (class 1255 OID 47265)
-- Name: user_has_role(uuid, public.user_role); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.user_has_role(_user_id uuid, _role public.user_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION public.user_has_role(_user_id uuid, _role public.user_role) OWNER TO postgres;

--
-- TOC entry 414 (class 1255 OID 17081)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 423 (class 1255 OID 17173)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- TOC entry 416 (class 1255 OID 17093)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- TOC entry 412 (class 1255 OID 17043)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- TOC entry 411 (class 1255 OID 17038)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- TOC entry 415 (class 1255 OID 17089)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- TOC entry 417 (class 1255 OID 17100)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 410 (class 1255 OID 17037)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- TOC entry 422 (class 1255 OID 17172)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- TOC entry 409 (class 1255 OID 17035)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- TOC entry 413 (class 1255 OID 17070)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- TOC entry 418 (class 1255 OID 17153)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- TOC entry 436 (class 1255 OID 17510)
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 426 (class 1255 OID 17204)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- TOC entry 437 (class 1255 OID 17511)
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 440 (class 1255 OID 17514)
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 446 (class 1255 OID 17529)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- TOC entry 421 (class 1255 OID 17157)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 420 (class 1255 OID 17156)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 419 (class 1255 OID 17155)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 433 (class 1255 OID 17492)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 434 (class 1255 OID 17508)
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 435 (class 1255 OID 17509)
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 444 (class 1255 OID 17527)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- TOC entry 428 (class 1255 OID 17246)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 427 (class 1255 OID 17209)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 439 (class 1255 OID 17513)
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 445 (class 1255 OID 17528)
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 429 (class 1255 OID 17262)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- TOC entry 438 (class 1255 OID 17512)
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 424 (class 1255 OID 17190)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 443 (class 1255 OID 17525)
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 442 (class 1255 OID 17524)
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 441 (class 1255 OID 17519)
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- TOC entry 425 (class 1255 OID 17191)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 251 (class 1259 OID 16523)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 268 (class 1259 OID 16925)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 259 (class 1259 OID 16723)
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- TOC entry 4875 (class 0 OID 0)
-- Dependencies: 259
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4876 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 250 (class 1259 OID 16516)
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- TOC entry 4878 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 263 (class 1259 OID 16812)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 263
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 262 (class 1259 OID 16800)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 261 (class 1259 OID 16787)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 261
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 315 (class 1259 OID 49487)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- TOC entry 269 (class 1259 OID 16975)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 249 (class 1259 OID 16505)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 248 (class 1259 OID 16504)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 248
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 266 (class 1259 OID 16854)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 267 (class 1259 OID 16872)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 252 (class 1259 OID 16531)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 260 (class 1259 OID 16753)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 260
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 265 (class 1259 OID 16839)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 264 (class 1259 OID 16830)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 247 (class 1259 OID 16493)
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 308 (class 1259 OID 46014)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 18930)
-- Name: api_integration_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_integration_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    api_name text NOT NULL,
    request_data jsonb,
    response_data jsonb,
    status text NOT NULL,
    response_time_ms integer,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT api_integration_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'error'::text, 'pending'::text])))
);


ALTER TABLE public.api_integration_logs OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 45986)
-- Name: application_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    document_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.application_documents OWNER TO postgres;

--
-- TOC entry 307 (class 1259 OID 46000)
-- Name: application_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    evaluator_id uuid NOT NULL,
    evaluator_role public.user_role NOT NULL,
    status text NOT NULL,
    comments text,
    decision text,
    evaluated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.application_evaluations OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 47247)
-- Name: application_workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_workflow (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    current_step text NOT NULL,
    workflow_role public.user_role NOT NULL,
    assigned_to uuid,
    step_completed_at timestamp with time zone,
    step_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.application_workflow OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 18915)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    table_name text,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 46081)
-- Name: captcha_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.captcha_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_token text NOT NULL,
    answer text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '00:10:00'::interval),
    used boolean DEFAULT false
);


ALTER TABLE public.captcha_sessions OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 45921)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    nib text,
    company_address text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    website text,
    business_field text NOT NULL,
    status public.company_status DEFAULT 'pending_verification'::public.company_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone,
    verified_by uuid,
    verification_notes text,
    verification_documents jsonb,
    nib_number text,
    npwp_number text,
    company_type public.company_type,
    akta_number text,
    province_id uuid,
    kabupaten_id uuid,
    kecamatan text,
    kelurahan text,
    postal_code text,
    correction_notes jsonb DEFAULT '{}'::jsonb,
    correction_status public.correction_status
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 57391)
-- Name: company_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    document_type public.document_type NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_size integer NOT NULL,
    mime_type text DEFAULT 'application/pdf'::text NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.company_documents OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 17339)
-- Name: faq_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faq_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faq_categories OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 17348)
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid,
    question text NOT NULL,
    answer text NOT NULL,
    file_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 31239)
-- Name: fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    field_type text DEFAULT 'text'::text NOT NULL,
    is_system_field boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fields OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 47236)
-- Name: indonesian_regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.indonesian_regions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region_id character varying(10) NOT NULL,
    name text NOT NULL,
    type character varying(20) NOT NULL,
    parent_id character varying(10),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.indonesian_regions OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 18875)
-- Name: kabupaten; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kabupaten (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    province_id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT kabupaten_type_check CHECK ((type = ANY (ARRAY['kabupaten'::text, 'kota'::text])))
);


ALTER TABLE public.kabupaten OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 45963)
-- Name: license_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_number text NOT NULL,
    company_id uuid NOT NULL,
    applicant_id uuid NOT NULL,
    license_service_id uuid NOT NULL,
    status public.application_status DEFAULT 'draft'::public.application_status NOT NULL,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    approved_by uuid,
    assigned_evaluator uuid,
    form_data jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_applications OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 45952)
-- Name: license_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    license_type public.license_type NOT NULL,
    description text,
    requirements jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_services OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 46071)
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    ip_address inet,
    attempted_at timestamp with time zone DEFAULT now(),
    success boolean DEFAULT false,
    user_agent text
);


ALTER TABLE public.login_attempts OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 31221)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    parent_module_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 31308)
-- Name: permission_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    target_role public.app_role NOT NULL,
    permissions_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permission_templates OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 31259)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role public.app_role NOT NULL,
    module_id uuid,
    field_id uuid,
    can_create boolean DEFAULT false NOT NULL,
    can_read boolean DEFAULT false NOT NULL,
    can_update boolean DEFAULT false NOT NULL,
    can_delete boolean DEFAULT false NOT NULL,
    field_access text DEFAULT 'read_only'::text,
    conditions jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 57409)
-- Name: person_in_charge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_in_charge (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    full_name text NOT NULL,
    id_number text NOT NULL,
    phone_number text NOT NULL,
    "position" text NOT NULL,
    province_id uuid,
    kabupaten_id uuid,
    kecamatan text,
    kelurahan text,
    postal_code text,
    address text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.person_in_charge OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 57434)
-- Name: pic_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pic_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pic_id uuid NOT NULL,
    document_type public.document_type NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_size integer NOT NULL,
    mime_type text DEFAULT 'application/pdf'::text NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.pic_documents OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 17307)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    company_name text,
    phone text,
    is_validated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    maksud_tujuan text
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 18863)
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    latitude numeric,
    longitude numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.provinces OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 31292)
-- Name: record_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.record_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    user_id uuid NOT NULL,
    permission_type text NOT NULL,
    granted_by uuid,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.record_permissions OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 18819)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 18833)
-- Name: sub_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sub_services OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 46023)
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_number text NOT NULL,
    company_id uuid NOT NULL,
    created_by uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    assigned_to uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 17383)
-- Name: telekom_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.telekom_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_type public.service_type NOT NULL,
    company_name text NOT NULL,
    license_number text,
    license_date date,
    status text DEFAULT 'active'::text,
    region text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    data_source text DEFAULT 'manual'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    file_url text,
    sub_service_type text,
    sub_service_id uuid,
    province_id uuid,
    kabupaten_id uuid,
    CONSTRAINT telekom_data_data_source_check CHECK ((data_source = ANY (ARRAY['manual'::text, 'api'::text, 'database'::text, 'import'::text]))),
    CONSTRAINT telekom_data_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text])))
);


ALTER TABLE public.telekom_data OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 17611)
-- Name: ticket_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_to uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    unassigned_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_assignments OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 17553)
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    is_admin_message boolean DEFAULT false NOT NULL,
    file_url text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_messages OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 17636)
-- Name: ticket_sla_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_sla_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    first_response_time_minutes integer,
    resolution_time_minutes integer,
    sla_target_response_minutes integer DEFAULT 240,
    sla_target_resolution_minutes integer DEFAULT 1440,
    response_sla_met boolean,
    resolution_sla_met boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_sla_metrics OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 17364)
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text,
    priority text DEFAULT 'medium'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    file_url text,
    category public.ticket_category DEFAULT 'general'::public.ticket_category,
    assigned_to uuid,
    assignment_status public.assignment_status DEFAULT 'unassigned'::public.assignment_status,
    first_response_at timestamp with time zone,
    resolved_at timestamp with time zone,
    escalated_at timestamp with time zone,
    escalation_level integer DEFAULT 0,
    due_date timestamp with time zone,
    tags text[],
    internal_notes text,
    CONSTRAINT tickets_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])))
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 46042)
-- Name: ulo_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ulo_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    license_application_id uuid NOT NULL,
    test_method public.test_method NOT NULL,
    status public.application_status DEFAULT 'submitted'::public.application_status NOT NULL,
    sklo_number text,
    sk_commitment_number text,
    qr_code_data text,
    digital_signature text,
    issued_at timestamp with time zone,
    issued_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ulo_applications OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 45935)
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid,
    full_name text NOT NULL,
    "position" text,
    phone text,
    role public.user_role DEFAULT 'pelaku_usaha'::public.user_role NOT NULL,
    is_company_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    specialization text
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 303
-- Name: COLUMN user_profiles.specialization; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_profiles.specialization IS 'License type specialization for evaluators and wakil ketua tim (jasa_telekomunikasi, jaringan_telekomunikasi, penomoran_telekomunikasi)';


--
-- TOC entry 281 (class 1259 OID 17325)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 17179)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- TOC entry 316 (class 1259 OID 57328)
-- Name: messages_2025_09_11; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_11 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_11 OWNER TO supabase_admin;

--
-- TOC entry 317 (class 1259 OID 57339)
-- Name: messages_2025_09_12; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_12 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_12 OWNER TO supabase_admin;

--
-- TOC entry 321 (class 1259 OID 57489)
-- Name: messages_2025_09_13; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_13 OWNER TO supabase_admin;

--
-- TOC entry 322 (class 1259 OID 58637)
-- Name: messages_2025_09_14; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_14 OWNER TO supabase_admin;

--
-- TOC entry 323 (class 1259 OID 59753)
-- Name: messages_2025_09_15; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_15 OWNER TO supabase_admin;

--
-- TOC entry 324 (class 1259 OID 60869)
-- Name: messages_2025_09_16; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_16 OWNER TO supabase_admin;

--
-- TOC entry 325 (class 1259 OID 63088)
-- Name: messages_2025_09_17; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_17 OWNER TO supabase_admin;

--
-- TOC entry 270 (class 1259 OID 17000)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- TOC entry 273 (class 1259 OID 17023)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- TOC entry 272 (class 1259 OID 17022)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 253 (class 1259 OID 16544)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 287 (class 1259 OID 17538)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- TOC entry 255 (class 1259 OID 16586)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- TOC entry 254 (class 1259 OID 16559)
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 254
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 286 (class 1259 OID 17493)
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- TOC entry 277 (class 1259 OID 17211)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- TOC entry 278 (class 1259 OID 17225)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- TOC entry 279 (class 1259 OID 17269)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- TOC entry 3761 (class 0 OID 0)
-- Name: messages_2025_09_11; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_11 FOR VALUES FROM ('2025-09-11 00:00:00') TO ('2025-09-12 00:00:00');


--
-- TOC entry 3762 (class 0 OID 0)
-- Name: messages_2025_09_12; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_12 FOR VALUES FROM ('2025-09-12 00:00:00') TO ('2025-09-13 00:00:00');


--
-- TOC entry 3763 (class 0 OID 0)
-- Name: messages_2025_09_13; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_13 FOR VALUES FROM ('2025-09-13 00:00:00') TO ('2025-09-14 00:00:00');


--
-- TOC entry 3764 (class 0 OID 0)
-- Name: messages_2025_09_14; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_14 FOR VALUES FROM ('2025-09-14 00:00:00') TO ('2025-09-15 00:00:00');


--
-- TOC entry 3765 (class 0 OID 0)
-- Name: messages_2025_09_15; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_15 FOR VALUES FROM ('2025-09-15 00:00:00') TO ('2025-09-16 00:00:00');


--
-- TOC entry 3766 (class 0 OID 0)
-- Name: messages_2025_09_16; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_16 FOR VALUES FROM ('2025-09-16 00:00:00') TO ('2025-09-17 00:00:00');


--
-- TOC entry 3767 (class 0 OID 0)
-- Name: messages_2025_09_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_17 FOR VALUES FROM ('2025-09-17 00:00:00') TO ('2025-09-18 00:00:00');


--
-- TOC entry 3777 (class 2604 OID 16508)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4689 (class 0 OID 16523)
-- Dependencies: 251
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	8b8a36ba-1b36-4089-a67c-011fae7058c0	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-30 07:31:51.791842+00	
00000000-0000-0000-0000-000000000000	6740bb71-db63-48f1-94c2-b966a50b4ae6	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 11:53:03.747781+00	
00000000-0000-0000-0000-000000000000	7b68bdf2-ea0c-4d9e-89ab-b03b2ea1ff52	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 11:53:03.752461+00	
00000000-0000-0000-0000-000000000000	df24c161-7696-46e0-a253-86e87176eda1	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-01 12:02:18.431285+00	
00000000-0000-0000-0000-000000000000	d5435d58-ef1f-42ae-8cc9-d1c81a11f8e7	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 13:00:29.223705+00	
00000000-0000-0000-0000-000000000000	48cd8f7a-5c39-4e80-ad9b-b06f031d4b42	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 13:00:29.22543+00	
00000000-0000-0000-0000-000000000000	b56577a7-0d29-4adc-98ab-4987af35117a	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 13:59:12.016339+00	
00000000-0000-0000-0000-000000000000	bd6f585b-3d41-4ba8-a412-ac71d6f754c7	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 13:59:12.017533+00	
00000000-0000-0000-0000-000000000000	e5eb3375-dca5-4dcb-82ad-431695ce1160	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 07:28:03.845977+00	
00000000-0000-0000-0000-000000000000	dda0022d-a720-471f-a806-1e55b9b9c422	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 07:51:55.184956+00	
00000000-0000-0000-0000-000000000000	27867b03-5d08-489b-a32c-cb7e1be009ae	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 08:18:30.380949+00	
00000000-0000-0000-0000-000000000000	b1f70093-279d-4fc1-a9eb-1f8ca593eeed	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 08:18:34.629258+00	
00000000-0000-0000-0000-000000000000	0c9b48fb-240c-4144-b977-16b89f6f8ebf	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 08:21:34.86964+00	
00000000-0000-0000-0000-000000000000	0ea911f6-2e92-4ad9-8981-e28f2e03aa14	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 08:21:40.992952+00	
00000000-0000-0000-0000-000000000000	c658c06a-57e6-41c7-9437-aab7bf99b902	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 09:13:42.517819+00	
00000000-0000-0000-0000-000000000000	7a18c719-9abc-4c5b-9ac7-b4a44ef373a1	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 09:57:27.829844+00	
00000000-0000-0000-0000-000000000000	8d3551aa-be5e-456f-8418-89b460ce33c6	{"action":"user_confirmation_requested","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-06 09:58:23.798144+00	
00000000-0000-0000-0000-000000000000	affb62e7-9b06-429f-9edc-2e9216704dc4	{"action":"user_signedup","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-06 10:01:54.389104+00	
00000000-0000-0000-0000-000000000000	dd733ddb-7775-40f2-aeba-8aae6ba28f63	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 10:03:06.255671+00	
00000000-0000-0000-0000-000000000000	bf162142-471e-4ce4-8a78-202d36791296	{"action":"user_confirmation_requested","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-06 10:03:37.428179+00	
00000000-0000-0000-0000-000000000000	481b0ad2-1b5e-4462-8de0-c1a87f79943f	{"action":"user_signedup","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-06 10:03:53.820858+00	
00000000-0000-0000-0000-000000000000	f6fede8a-838c-4489-8329-905635d927b8	{"action":"logout","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 10:04:32.773129+00	
00000000-0000-0000-0000-000000000000	214e0c19-3a24-4e5d-b471-e9c162258cf5	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 10:05:41.641425+00	
00000000-0000-0000-0000-000000000000	5297b8ba-7d45-4c63-812d-3d786a12a1d0	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 10:14:26.747107+00	
00000000-0000-0000-0000-000000000000	f5cb3c05-43c9-4212-9ab6-a3a4b02180fb	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 10:14:43.269839+00	
00000000-0000-0000-0000-000000000000	c26b3311-6092-47ff-ab87-7a04ed976317	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 10:19:01.942685+00	
00000000-0000-0000-0000-000000000000	8b436abf-fb16-472c-b1d9-009f2e854711	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 10:20:01.344464+00	
00000000-0000-0000-0000-000000000000	a570052b-730f-4208-9cb9-c23a00dc60c8	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 11:18:31.898346+00	
00000000-0000-0000-0000-000000000000	fd5ba69a-074b-45e8-8e73-50f7e60675f9	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 11:18:31.914093+00	
00000000-0000-0000-0000-000000000000	3bd0912e-1d34-4af4-9023-3a15e7dd4576	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 12:16:41.43728+00	
00000000-0000-0000-0000-000000000000	84098f5f-d0be-4494-ad73-fbbf531e48c6	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 12:16:41.460183+00	
00000000-0000-0000-0000-000000000000	d233b9e0-436c-4566-9a1b-a353c47a3b36	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 13:15:11.733033+00	
00000000-0000-0000-0000-000000000000	f652c0ef-885f-4f23-8f55-6af2d8d55ca6	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 13:15:11.751056+00	
00000000-0000-0000-0000-000000000000	5d96f17f-02b6-4758-9138-23875c694477	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 13:58:38.220109+00	
00000000-0000-0000-0000-000000000000	3469d560-5731-4fb1-a22b-f0a859dbda67	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 13:58:45.798041+00	
00000000-0000-0000-0000-000000000000	5887bc66-03fe-4db7-8b92-ef1f63d9e2e0	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 13:59:39.523296+00	
00000000-0000-0000-0000-000000000000	f0585f54-9b18-439a-a82e-fb2ed32f98cb	{"action":"user_confirmation_requested","actor_id":"23900513-e747-4788-a1d5-5c77bca39c25","actor_name":"Testing2","actor_username":"dbstorages2@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-06 14:11:56.5743+00	
00000000-0000-0000-0000-000000000000	d0d03a6b-30ab-4e7c-8082-0645a68a5f8c	{"action":"login","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:13:58.265737+00	
00000000-0000-0000-0000-000000000000	5e916670-a447-47a6-b9f6-1bbf880fc8bc	{"action":"logout","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:14:19.857436+00	
00000000-0000-0000-0000-000000000000	4534f670-4d65-4790-a5bf-2a45685d7161	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:14:28.44973+00	
00000000-0000-0000-0000-000000000000	7b8616b1-bfc3-4de4-8f5b-bd93efdc6683	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:15:57.013326+00	
00000000-0000-0000-0000-000000000000	d5a8fb9e-ce99-4dbc-8a04-a23c1ba86b18	{"action":"user_signedup","actor_id":"23900513-e747-4788-a1d5-5c77bca39c25","actor_name":"Testing2","actor_username":"dbstorages2@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-06 14:17:13.3664+00	
00000000-0000-0000-0000-000000000000	aa181430-a657-4c2a-9510-771e8d487c9b	{"action":"login","actor_id":"23900513-e747-4788-a1d5-5c77bca39c25","actor_name":"Testing2","actor_username":"dbstorages2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:17:25.127242+00	
00000000-0000-0000-0000-000000000000	6c9e6b9d-79c3-46f8-b64d-6d924369e2d2	{"action":"logout","actor_id":"23900513-e747-4788-a1d5-5c77bca39c25","actor_name":"Testing2","actor_username":"dbstorages2@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:17:35.546816+00	
00000000-0000-0000-0000-000000000000	3c90368a-1e82-42d8-bbbc-db7d1441a595	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:17:50.106104+00	
00000000-0000-0000-0000-000000000000	16063311-99f4-4eee-b163-f9512636246a	{"action":"login","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:25:17.592676+00	
00000000-0000-0000-0000-000000000000	3e8628d2-6162-4922-bf64-fe948f29693e	{"action":"logout","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:30:13.490362+00	
00000000-0000-0000-0000-000000000000	c0b3880b-74bd-48dd-97b5-ab2d277c54e0	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:30:30.946958+00	
00000000-0000-0000-0000-000000000000	4137838c-2b86-4d8f-8ff9-15f9b813eb14	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:32:44.480925+00	
00000000-0000-0000-0000-000000000000	4b9178c6-27b5-40da-95ea-4ab3e2925a64	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:32:53.498315+00	
00000000-0000-0000-0000-000000000000	9daa4b1f-b5a9-4680-8a10-58674ff0ddb3	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:33:09.010115+00	
00000000-0000-0000-0000-000000000000	20451dec-c551-4127-a26d-f67ab6689f6d	{"action":"login","actor_id":"23900513-e747-4788-a1d5-5c77bca39c25","actor_name":"Testing2","actor_username":"dbstorages2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:33:19.696864+00	
00000000-0000-0000-0000-000000000000	1aea7422-b2f2-4f67-9c63-5ea3bb764ef0	{"action":"logout","actor_id":"23900513-e747-4788-a1d5-5c77bca39c25","actor_name":"Testing2","actor_username":"dbstorages2@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:41:47.25122+00	
00000000-0000-0000-0000-000000000000	89bb2987-61dd-4b09-b2c1-70757a7ae4f8	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:43:20.831788+00	
00000000-0000-0000-0000-000000000000	116930ea-58f6-466a-9f0a-8cd133495f94	{"action":"logout","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:43:24.314357+00	
00000000-0000-0000-0000-000000000000	48765bf6-9928-4b04-b720-5bef038c39f2	{"action":"login","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 14:43:35.96862+00	
00000000-0000-0000-0000-000000000000	e1478eac-8027-491c-a69d-2c0d70b07ce4	{"action":"logout","actor_id":"4e7af1b9-537b-4574-a2db-05fd55bc1824","actor_name":"Testing2","actor_username":"alvinoa35@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:47:33.64214+00	
00000000-0000-0000-0000-000000000000	0e589d6a-a653-4577-91f0-67a149e5e839	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 14:56:56.84985+00	
00000000-0000-0000-0000-000000000000	179e1e81-dd4d-4123-a107-fb7e26d5ec8a	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 15:46:19.036918+00	
00000000-0000-0000-0000-000000000000	63dafbf2-565e-4bc2-8473-fb8fee01315e	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 16:07:13.55427+00	
00000000-0000-0000-0000-000000000000	3b6ac9cf-6340-475e-9dd7-85618579081d	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 16:18:42.223196+00	
00000000-0000-0000-0000-000000000000	18a00883-6732-4edb-9d62-c6682cefff4f	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 16:18:54.920963+00	
00000000-0000-0000-0000-000000000000	007513be-8a0f-4655-a89c-9e4333ccf46e	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 16:19:11.021898+00	
00000000-0000-0000-0000-000000000000	a6e4a556-f648-4abd-afda-6f22ae1825de	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 17:17:47.425877+00	
00000000-0000-0000-0000-000000000000	13a65786-b6f7-46b9-8b99-a99d498c1948	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 17:17:47.440916+00	
00000000-0000-0000-0000-000000000000	3bd6872b-ba1e-4d0c-8ebb-4bf83d9cb650	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 18:17:15.01093+00	
00000000-0000-0000-0000-000000000000	652e0b31-32d6-4573-a175-2b66e382be47	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 18:17:15.038034+00	
00000000-0000-0000-0000-000000000000	bc64e789-6abe-40a2-8bfb-3ae6530bce67	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 19:15:53.850928+00	
00000000-0000-0000-0000-000000000000	2f32a03b-b137-46a5-a03a-04002dca11dc	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 19:15:53.870775+00	
00000000-0000-0000-0000-000000000000	cca9436c-5a82-4091-a1a6-7637133167f6	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 19:35:30.688783+00	
00000000-0000-0000-0000-000000000000	70aaba39-2903-4b03-9e6c-cef9d0e66313	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 19:36:00.577325+00	
00000000-0000-0000-0000-000000000000	4b36b197-1253-4022-b3fd-c575f135f4f3	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 19:36:46.420579+00	
00000000-0000-0000-0000-000000000000	a44c2fbe-4a8a-4b72-a268-46556297d03d	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 20:34:49.84024+00	
00000000-0000-0000-0000-000000000000	2cddb59d-c686-40ac-a71c-b580eddf1921	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 20:34:49.853118+00	
00000000-0000-0000-0000-000000000000	4d70a659-e930-44f0-8d3b-be529306dcdb	{"action":"token_refreshed","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 20:34:57.80873+00	
00000000-0000-0000-0000-000000000000	c01d8391-666b-4b7b-b4b9-38a8d919030e	{"action":"token_revoked","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 20:34:57.809795+00	
00000000-0000-0000-0000-000000000000	33dd1310-b974-40c8-a284-d11547991eb1	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 10:55:57.077448+00	
00000000-0000-0000-0000-000000000000	d3cff790-cad8-4f30-b6dd-86d7014fb206	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 10:56:58.264989+00	
00000000-0000-0000-0000-000000000000	72093b8e-7aab-4197-8342-dcbdf43ed15a	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 10:59:55.628706+00	
00000000-0000-0000-0000-000000000000	246dd99f-61ef-41fc-8571-ceecd60dc209	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 11:12:11.685506+00	
00000000-0000-0000-0000-000000000000	43aa2456-eaa6-4352-b711-82c249db5cda	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 11:28:51.668552+00	
00000000-0000-0000-0000-000000000000	63fa3cb2-2997-4dc5-83d4-dc0adcc75005	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 11:29:15.235639+00	
00000000-0000-0000-0000-000000000000	edd3a9d7-74dd-4254-bbfc-04ae50beb2c7	{"action":"user_confirmation_requested","actor_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","actor_name":"Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-09 15:05:41.100189+00	
00000000-0000-0000-0000-000000000000	6fa8f5b3-0795-4b22-a1ff-bac1f7c56092	{"action":"user_signedup","actor_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","actor_name":"Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-09 15:11:23.40546+00	
00000000-0000-0000-0000-000000000000	0e27f19b-e151-4608-b3bd-50b93ec08a26	{"action":"login","actor_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","actor_name":"Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 15:11:23.421914+00	
00000000-0000-0000-0000-000000000000	ab7369cc-ddf5-478f-9c59-80c26f052e2c	{"action":"user_recovery_requested","actor_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","actor_name":"Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-09 15:11:23.46776+00	
00000000-0000-0000-0000-000000000000	564a2753-a7a9-4baa-aae4-18f386d853fb	{"action":"user_recovery_requested","actor_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","actor_name":"Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-09 15:12:49.62257+00	
00000000-0000-0000-0000-000000000000	cc009786-3f75-4913-adb0-a85c66e96f00	{"action":"login","actor_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","actor_name":"Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 15:17:18.05425+00	
00000000-0000-0000-0000-000000000000	ee1efbfb-25c9-4947-a4be-9b61c1b2f15b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev.ademaryadi@gmail.com","user_id":"aad59621-a875-43d6-b1b5-889fdbd19e52","user_phone":""}}	2025-09-09 15:22:48.173641+00	
00000000-0000-0000-0000-000000000000	7569259d-e224-4be0-8a1d-1ee3853fc6bb	{"action":"user_signedup","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-09 15:24:41.365007+00	
00000000-0000-0000-0000-000000000000	8479a5a8-78fd-4f5a-ab68-fd7edda69f9a	{"action":"login","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 15:24:41.368763+00	
00000000-0000-0000-0000-000000000000	880f06d8-7275-47ab-8b61-231a02906a57	{"action":"logout","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 15:25:17.590198+00	
00000000-0000-0000-0000-000000000000	9416b12f-1726-431c-b8df-d814d3b741ce	{"action":"login","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 15:25:37.336172+00	
00000000-0000-0000-0000-000000000000	b88cac3a-6687-46a4-8e23-29ad7595b5d5	{"action":"logout","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 15:29:32.49633+00	
00000000-0000-0000-0000-000000000000	6ab38fc0-3e41-4f2f-bab4-67999cce8b3e	{"action":"login","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 15:46:20.405822+00	
00000000-0000-0000-0000-000000000000	e1f739a4-355c-4f84-b15c-692b7d30370d	{"action":"token_refreshed","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 16:44:24.775466+00	
00000000-0000-0000-0000-000000000000	43d5e0b6-92d0-433d-ad6d-ded48f81c79f	{"action":"token_revoked","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 16:44:24.791791+00	
00000000-0000-0000-0000-000000000000	05172bd2-e3a8-43f0-8573-ddb42d54a974	{"action":"token_refreshed","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 17:43:07.492758+00	
00000000-0000-0000-0000-000000000000	fa4d1c30-d805-498a-bb3c-266e131dbb0c	{"action":"token_revoked","actor_id":"a822f3d9-4d83-4827-b3e3-7b2aec2d4999","actor_name":"Stefanus Ade Maryadi","actor_username":"dev.ademaryadi@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 17:43:07.507484+00	
00000000-0000-0000-0000-000000000000	21f90a3b-00b8-4a23-9f45-68fdb1ad91d2	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 00:57:41.323925+00	
00000000-0000-0000-0000-000000000000	d7b73249-603e-4f8e-a97b-5954d03d9447	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 01:50:50.619529+00	
00000000-0000-0000-0000-000000000000	8c412cea-0eb2-470b-870a-0941c7385027	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 02:20:48.954482+00	
00000000-0000-0000-0000-000000000000	1899b08e-d595-43c4-a1b7-7d34ccd6170a	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 02:51:12.697435+00	
00000000-0000-0000-0000-000000000000	ca53fa59-8050-415e-a1eb-a2a7e847712e	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 02:53:23.706446+00	
00000000-0000-0000-0000-000000000000	272e0624-034a-4bf3-851a-35282dca3f03	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 03:52:19.917244+00	
00000000-0000-0000-0000-000000000000	ae2b7287-70c9-4b4c-8a41-c7bb3008f652	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 03:52:19.931085+00	
00000000-0000-0000-0000-000000000000	ac6f5f7a-8973-4096-b88a-a963ef2f29e5	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 04:28:36.97647+00	
00000000-0000-0000-0000-000000000000	e900b40e-ade8-4eb7-a8c2-e7fb05d6e0cc	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 05:24:30.385369+00	
00000000-0000-0000-0000-000000000000	4a7ffd53-517f-4826-9d80-1ab5334e40ae	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"am.ademaryadi.bct@gmail.com","user_id":"a0a88d79-bcbc-46c6-ab50-c671ab894d97","user_phone":""}}	2025-09-10 05:49:39.577615+00	
00000000-0000-0000-0000-000000000000	16e12e6a-b4e9-4b0b-a6f5-b98fc8860517	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 05:52:16.521481+00	
00000000-0000-0000-0000-000000000000	a45c19d4-d1f6-4690-ba4c-9a45f187b59e	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 06:08:51.879786+00	
00000000-0000-0000-0000-000000000000	ec2aaf22-0d9c-490a-89a2-980acbca0511	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 06:09:55.479784+00	
00000000-0000-0000-0000-000000000000	dd704eae-ae0a-4add-b136-21e2847be63d	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 06:16:04.653642+00	
00000000-0000-0000-0000-000000000000	66257df5-228a-47bf-a7a5-c13bb4d866f6	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 06:18:49.434826+00	
00000000-0000-0000-0000-000000000000	cbbe1e3f-d3a1-42c3-81b9-fffef67a26da	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 06:20:35.737616+00	
00000000-0000-0000-0000-000000000000	f6602af0-4b02-4b41-8e97-e32fe3e58efb	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 06:24:26.569088+00	
00000000-0000-0000-0000-000000000000	5603a02d-ca3f-4766-ad98-75bcbb7693fb	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 06:26:19.299341+00	
00000000-0000-0000-0000-000000000000	5cea7c2d-ed74-4d45-97d9-df10aabe202a	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:09:07.127257+00	
00000000-0000-0000-0000-000000000000	02acd418-d715-496e-bfa2-b016ca1c1158	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:20:05.235145+00	
00000000-0000-0000-0000-000000000000	a408605e-5f5c-475f-94c5-b7501e78ad84	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:24:56.055511+00	
00000000-0000-0000-0000-000000000000	f08b20e4-49f6-46ae-9534-540d52d9c001	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:32:32.202426+00	
00000000-0000-0000-0000-000000000000	14f66d8a-4e87-4704-a53f-a1d2aeda8e96	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:33:09.248758+00	
00000000-0000-0000-0000-000000000000	4d49e362-4a60-4089-ae77-fdb100e4eb24	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:42:34.37398+00	
00000000-0000-0000-0000-000000000000	e6df1c64-6943-4ee4-b6cb-bcc70c29782d	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:43:43.907014+00	
00000000-0000-0000-0000-000000000000	337c3ff6-c645-4ae7-9d30-cc26e91f8f69	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:44:09.292532+00	
00000000-0000-0000-0000-000000000000	478a269e-518f-438d-96d9-04cc0103b878	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:46:05.498251+00	
00000000-0000-0000-0000-000000000000	f9500645-3c02-44bc-99b8-693bfdd792a8	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:51:59.858085+00	
00000000-0000-0000-0000-000000000000	27d489a5-a715-4a7b-b1b1-4ab82570838f	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:52:37.044634+00	
00000000-0000-0000-0000-000000000000	d7df80ce-11ad-45a5-ba2d-9925d1242842	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:57:31.986216+00	
00000000-0000-0000-0000-000000000000	867489bf-e30b-4b3b-ac40-65870134556c	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 08:22:11.059502+00	
00000000-0000-0000-0000-000000000000	e2eebff2-1b23-481d-b9f8-23372d6d3857	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 08:24:20.165661+00	
00000000-0000-0000-0000-000000000000	7af8bb0f-399c-40e3-971b-ca9ef27ba2eb	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:23:19.584859+00	
00000000-0000-0000-0000-000000000000	d3a51439-2379-42af-b048-71507ed68f63	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:23:19.598841+00	
00000000-0000-0000-0000-000000000000	6d2462db-9a81-41d6-9cf4-21476d29cef8	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 09:46:57.986765+00	
00000000-0000-0000-0000-000000000000	40c6387a-6222-41c2-832f-ae40c751d4cf	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:48:48.0776+00	
00000000-0000-0000-0000-000000000000	37b703b1-7a40-49d4-bbe7-94a7225e256c	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 09:49:14.07326+00	
00000000-0000-0000-0000-000000000000	069e9764-a5f9-4cdc-8252-7633836703d8	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:53:37.184683+00	
00000000-0000-0000-0000-000000000000	6d416c3a-1be5-4b8e-8fbd-94a9daa42418	{"action":"login","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 10:19:52.79592+00	
00000000-0000-0000-0000-000000000000	dbaa67e5-79fa-4b6c-b682-488ff9802b35	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 10:52:05.290761+00	
00000000-0000-0000-0000-000000000000	83d7e763-66af-4b83-a925-c3d762e869af	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 10:52:05.305898+00	
00000000-0000-0000-0000-000000000000	aec54f40-ed0c-4276-bbe4-ddb435888a58	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:50:35.494634+00	
00000000-0000-0000-0000-000000000000	13ffdd8f-2791-4839-8594-b081b64f5459	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:50:35.514363+00	
00000000-0000-0000-0000-000000000000	fe8043a0-fa0c-4f57-b643-a3b28a97723d	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 13:18:06.836805+00	
00000000-0000-0000-0000-000000000000	21d46e58-9865-4d96-8b6a-8f37814e49f8	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 13:18:06.861036+00	
00000000-0000-0000-0000-000000000000	41cf82a5-8cba-4969-8541-c61c49ca1104	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 14:16:13.560647+00	
00000000-0000-0000-0000-000000000000	aeb4a912-384d-41ac-b5fb-47845abfe401	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 14:16:13.575894+00	
00000000-0000-0000-0000-000000000000	7b101c2a-0ec9-413f-ae97-8822141209a1	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 15:14:52.267369+00	
00000000-0000-0000-0000-000000000000	66de81f3-c2d5-473b-8e34-2941865016dc	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 15:14:52.285515+00	
00000000-0000-0000-0000-000000000000	8d5be155-da4c-48bd-9a62-544e681892d2	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:13:52.194734+00	
00000000-0000-0000-0000-000000000000	6dfbbaec-6b0b-4cab-990d-b31352808814	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:13:52.209077+00	
00000000-0000-0000-0000-000000000000	a2385ed1-e1d5-41a5-bd54-01e52ff257fe	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:12:52.41728+00	
00000000-0000-0000-0000-000000000000	a9fcfa15-d835-4d5a-8e08-e4451f89d1fe	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:12:52.436488+00	
00000000-0000-0000-0000-000000000000	cae410bc-cda9-4fab-983c-e5a105652468	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:11:03.009759+00	
00000000-0000-0000-0000-000000000000	b05b5efc-fc7e-448a-bb10-7b33deacf5ba	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:11:03.025342+00	
00000000-0000-0000-0000-000000000000	1cd8543c-5e7a-48ae-a908-19a69c69c058	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:09:23.832459+00	
00000000-0000-0000-0000-000000000000	ec105528-5806-4b51-a33e-7e2b1c6881a7	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:09:23.858155+00	
00000000-0000-0000-0000-000000000000	74e8250d-8fd7-4e39-86f3-b0c7e3557252	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 01:07:34.012036+00	
00000000-0000-0000-0000-000000000000	3a9d3b75-e4af-45fc-938b-4f5d9113d292	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 01:07:34.029797+00	
00000000-0000-0000-0000-000000000000	6bbc1d96-30df-479c-b0be-08848863aeac	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 02:06:29.79326+00	
00000000-0000-0000-0000-000000000000	23e7c6bc-823b-486e-bbce-bd88bedee3e7	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 02:06:29.809829+00	
00000000-0000-0000-0000-000000000000	7001600a-7884-41d4-9593-8d6eafaa37de	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-11 02:53:31.921886+00	
00000000-0000-0000-0000-000000000000	aed2c6d8-9fea-4703-8d23-fc4af6247e9c	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 03:18:35.007308+00	
00000000-0000-0000-0000-000000000000	50ecee3f-dc0c-4dad-9b77-a0e637f0de43	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-11 03:18:40.159497+00	
00000000-0000-0000-0000-000000000000	c81aafd7-10f8-4577-90a9-773215dbca12	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 03:23:42.706223+00	
00000000-0000-0000-0000-000000000000	de2df332-2f22-4798-a14f-3c51678a181f	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 04:22:30.452715+00	
00000000-0000-0000-0000-000000000000	62113a8c-bd54-42c4-8251-85a80014b78c	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 04:22:30.479012+00	
00000000-0000-0000-0000-000000000000	bb4d7fc2-0919-4be5-a76d-08c97525e5f2	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 05:21:32.382764+00	
00000000-0000-0000-0000-000000000000	5ee3053a-03a2-4d4b-a89f-14a5b1b24b9c	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 05:21:32.396125+00	
00000000-0000-0000-0000-000000000000	0a0a31ca-d34b-4f9f-8ba5-13591414da96	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 06:20:30.691242+00	
00000000-0000-0000-0000-000000000000	f51f6a42-65b9-4ee1-ad04-0e6cdab4cd9f	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 06:20:30.711578+00	
00000000-0000-0000-0000-000000000000	6eaad2f5-1a9b-4f57-bb55-689e0c11e8d7	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:19:30.790913+00	
00000000-0000-0000-0000-000000000000	f6d69ff7-3409-4c4c-84ae-e0dfc88fbc42	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:19:30.81457+00	
00000000-0000-0000-0000-000000000000	3f655be5-4d72-4622-933e-f2b9e15e1d76	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:18:30.722165+00	
00000000-0000-0000-0000-000000000000	42b1f21e-ea99-46e5-b583-d465ee6a0d34	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:18:30.74665+00	
00000000-0000-0000-0000-000000000000	85ed8c8a-671a-4060-af83-8ada98bf7c37	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:17:30.755824+00	
00000000-0000-0000-0000-000000000000	12d674e5-f267-4994-99ef-cbd59cd3d346	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:17:30.77989+00	
00000000-0000-0000-0000-000000000000	e6f91c31-6dd5-418d-8121-91e75ca8f378	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:16:31.748256+00	
00000000-0000-0000-0000-000000000000	8280a308-c4c4-49b8-bf27-283cc5017957	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:16:31.771341+00	
00000000-0000-0000-0000-000000000000	02a95777-2447-4747-a806-9df5f1b5534c	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:15:31.027528+00	
00000000-0000-0000-0000-000000000000	e7247383-8a73-468c-8ab7-086bef631884	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:15:31.048988+00	
00000000-0000-0000-0000-000000000000	b8e8e935-9274-4895-9110-fbad6b625571	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:14:30.941162+00	
00000000-0000-0000-0000-000000000000	bffbe6cc-eba6-4226-80f2-1e6f1b8df38b	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:14:30.958251+00	
00000000-0000-0000-0000-000000000000	51f775a7-c3a7-4e06-998b-984ed0ede0eb	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:13:02.816025+00	
00000000-0000-0000-0000-000000000000	6faa097b-3a54-42b6-9cc4-55edcb9d12f9	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:13:02.840024+00	
00000000-0000-0000-0000-000000000000	a9663672-d67e-4d1b-a837-5e7d2c1de657	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:12:31.319804+00	
00000000-0000-0000-0000-000000000000	13210d3b-c604-429c-98e5-1ad609c3d4f3	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:12:31.338105+00	
00000000-0000-0000-0000-000000000000	57d98168-f80d-498a-b25f-c5337db080f6	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:11:31.261536+00	
00000000-0000-0000-0000-000000000000	fa900fe3-f2d8-4cb6-bbda-618808cad13e	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:11:31.268521+00	
00000000-0000-0000-0000-000000000000	3c7b7f4f-a65c-4e48-af24-f4f55bdf02fa	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:10:31.252753+00	
00000000-0000-0000-0000-000000000000	03a65af1-4a19-41d7-ab93-17129f38fe01	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:10:31.266203+00	
00000000-0000-0000-0000-000000000000	82aebe55-767e-41b1-953e-32ed5fd42a7a	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 17:09:31.095688+00	
00000000-0000-0000-0000-000000000000	d2f08b42-f5ee-46fc-88ac-e34814cfa600	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 17:09:31.112736+00	
00000000-0000-0000-0000-000000000000	31c71488-f906-47c4-a22c-9d0c24f21696	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:08:31.33198+00	
00000000-0000-0000-0000-000000000000	533a302d-19e8-4574-88d1-a89968e36708	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:08:31.356919+00	
00000000-0000-0000-0000-000000000000	ba482eb1-0124-4907-97cf-7177970538f4	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:07:31.250898+00	
00000000-0000-0000-0000-000000000000	b6df3b06-01da-4a67-be31-a6bdcc2d192b	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:07:31.273399+00	
00000000-0000-0000-0000-000000000000	29481f43-8309-4420-a34e-efa623ee6eea	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 20:06:31.291825+00	
00000000-0000-0000-0000-000000000000	4152cca0-8c82-4bb0-a2a3-731bd6d40f31	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 20:06:31.316623+00	
00000000-0000-0000-0000-000000000000	0c06ed65-dd2e-4f15-aece-33f2925c57cf	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 21:05:31.249552+00	
00000000-0000-0000-0000-000000000000	1f6c1442-8a2f-41c0-b0e7-a19cbf01c51c	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 21:05:31.274439+00	
00000000-0000-0000-0000-000000000000	f7acde90-b258-4553-8c6c-ae26ef9fe5b1	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 22:04:31.396091+00	
00000000-0000-0000-0000-000000000000	684b5309-7426-4adf-9381-3d7f0ad15582	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 22:04:31.408092+00	
00000000-0000-0000-0000-000000000000	a0723b12-ce4d-497d-b773-11f6583a4fea	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 23:03:31.454095+00	
00000000-0000-0000-0000-000000000000	7af6ff02-d9c6-4129-877a-4b45326e6641	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 23:03:31.473457+00	
00000000-0000-0000-0000-000000000000	4be95850-b5e4-4869-9e26-6828b7ffebfd	{"action":"logout","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-11 23:52:30.761731+00	
00000000-0000-0000-0000-000000000000	0b1abe83-8852-48e6-9946-df6fc741a23b	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 00:34:10.816919+00	
00000000-0000-0000-0000-000000000000	c1678d1f-e515-440d-945d-7cccb59ad572	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 01:32:33.589392+00	
00000000-0000-0000-0000-000000000000	15eab96d-72a5-4bce-96a0-8d0a726a3384	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 01:32:33.611511+00	
00000000-0000-0000-0000-000000000000	ff6c1f1a-19a1-4ae6-aac8-4d2fd7434d2c	{"action":"token_refreshed","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 02:01:00.159306+00	
00000000-0000-0000-0000-000000000000	b50914f1-7c19-4bd6-bbdb-c014225c2779	{"action":"token_revoked","actor_id":"82005f7d-33a7-4119-8262-8ca6ba11d099","actor_name":"Fredy Curs","actor_username":"fredycurs22@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 02:01:00.173625+00	
00000000-0000-0000-0000-000000000000	8e9fbe17-f1a9-454e-8248-2f1bb4c0f97f	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 02:48:45.637651+00	
00000000-0000-0000-0000-000000000000	4c11891b-30db-4791-8498-58580974a8c4	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 03:48:07.554946+00	
00000000-0000-0000-0000-000000000000	3aa7b773-2f1f-435d-bd48-49d3739a7bb8	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 03:48:07.57212+00	
00000000-0000-0000-0000-000000000000	964a795e-c7f1-4653-9dd3-6bfe9d31a70a	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 04:47:07.55898+00	
00000000-0000-0000-0000-000000000000	7004c611-6ae0-4936-abe8-4a0f7752a996	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 04:47:07.577966+00	
00000000-0000-0000-0000-000000000000	65ad1ef6-b642-4adf-a0d6-da67932aef4a	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 05:05:08.669391+00	
00000000-0000-0000-0000-000000000000	527eaa50-59a0-4d51-95e1-3946ff888eba	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 05:12:57.938708+00	
00000000-0000-0000-0000-000000000000	ddeeff63-9154-4e9a-880d-75b784d72705	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 05:46:07.298336+00	
00000000-0000-0000-0000-000000000000	115833f3-fad3-4e69-8513-81366c90a64f	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 05:46:07.313183+00	
00000000-0000-0000-0000-000000000000	c188468d-769d-4aaa-bcee-df4772949b52	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 06:12:07.490318+00	
00000000-0000-0000-0000-000000000000	ea08664b-8e7b-423f-a124-4ee0a3cc2587	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 06:12:07.49779+00	
00000000-0000-0000-0000-000000000000	f07b342c-7539-4f11-b1c3-a6c139948aad	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 06:45:07.394815+00	
00000000-0000-0000-0000-000000000000	178901b0-469c-456c-b319-ad8362d03563	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 06:45:07.403993+00	
00000000-0000-0000-0000-000000000000	3d7b4104-1fa4-4865-90d8-c1160f9875d0	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:11:07.305636+00	
00000000-0000-0000-0000-000000000000	6c985f3f-4c72-4654-ab30-1a6748f9ff3e	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:11:07.313342+00	
00000000-0000-0000-0000-000000000000	d20ba28e-4def-41a8-9019-de87304b57c6	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:45:47.915087+00	
00000000-0000-0000-0000-000000000000	e366fe65-2ddb-4141-b417-7f37b049be6e	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:45:47.928749+00	
00000000-0000-0000-0000-000000000000	db24d573-d67d-48de-8486-ee8b0cc664e4	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:10:08.244658+00	
00000000-0000-0000-0000-000000000000	be3dfafd-5f3e-41df-b89c-8aaad93d5c74	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:10:08.258775+00	
00000000-0000-0000-0000-000000000000	d5dd462f-6d7c-4e56-b552-7e6945b2bce4	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:45:07.307575+00	
00000000-0000-0000-0000-000000000000	b53e772b-9044-4a34-b967-00da425d5509	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:45:07.31857+00	
00000000-0000-0000-0000-000000000000	c52ee05f-fc34-4d96-81ac-f13aca20f0db	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:09:07.24623+00	
00000000-0000-0000-0000-000000000000	25d25c24-e096-4a84-94ad-82e2514789d1	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:09:07.259715+00	
00000000-0000-0000-0000-000000000000	81cd8088-cdaf-4384-a3a4-68a12dafc797	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:44:07.232971+00	
00000000-0000-0000-0000-000000000000	d2530fa6-5836-418b-971f-04cf921ee341	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:44:07.245732+00	
00000000-0000-0000-0000-000000000000	32e303be-d863-4399-92a4-cb97f30d93d1	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:08:07.246238+00	
00000000-0000-0000-0000-000000000000	e3d7b945-4bd7-43bc-85ec-60c8d8bb76c6	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:08:07.26364+00	
00000000-0000-0000-0000-000000000000	8d4dc6fb-5b13-4237-a020-78cfd91a9e46	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:43:07.288748+00	
00000000-0000-0000-0000-000000000000	ef442d31-8397-4aa7-af9f-166db61fe8df	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:43:07.299276+00	
00000000-0000-0000-0000-000000000000	39356252-8ee9-4b86-a9a8-ec996051fa13	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:07:07.098686+00	
00000000-0000-0000-0000-000000000000	9e1fd888-d103-4324-bb0c-462066e47191	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:07:07.110736+00	
00000000-0000-0000-0000-000000000000	58cc52ae-271e-4eb3-9247-89f1f4e2fb35	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:42:07.1644+00	
00000000-0000-0000-0000-000000000000	29ce2bac-fb32-450a-85f1-940e4e19d8fc	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:42:07.17444+00	
00000000-0000-0000-0000-000000000000	02c407b2-d0fe-47de-ad5e-b37c2526bd61	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:06:07.10462+00	
00000000-0000-0000-0000-000000000000	8763023b-9550-4716-8c11-c899d2419af0	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:06:07.116386+00	
00000000-0000-0000-0000-000000000000	71772e48-b58a-4e8b-bf75-65150297647f	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:41:07.126365+00	
00000000-0000-0000-0000-000000000000	b61dba9a-1157-4209-9e58-53d849c9ddb8	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:41:07.135825+00	
00000000-0000-0000-0000-000000000000	f56a1291-7eff-4b6b-929b-5ce5d69d1465	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:05:07.104246+00	
00000000-0000-0000-0000-000000000000	d489c094-b671-42e7-8373-1e297a133ca1	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:05:07.112429+00	
00000000-0000-0000-0000-000000000000	90b42a6e-92b0-46e5-a959-951ab15c8a22	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:40:07.267439+00	
00000000-0000-0000-0000-000000000000	19ba5e24-cfb2-469f-a461-d20378750fe5	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:40:07.275934+00	
00000000-0000-0000-0000-000000000000	de49739f-2059-4a26-bfe1-0083bc260c58	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:04:07.238124+00	
00000000-0000-0000-0000-000000000000	ed52e4a6-961c-4eda-b86c-c7dc1cba176c	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:04:07.252905+00	
00000000-0000-0000-0000-000000000000	29fcc6f1-0767-4655-a253-00bd35dfd1b4	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:39:07.183723+00	
00000000-0000-0000-0000-000000000000	27892df5-521b-4044-b40a-7060f20c9d22	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:39:07.194436+00	
00000000-0000-0000-0000-000000000000	9c85cb66-d24d-4258-8685-160694cf8325	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:03:07.170588+00	
00000000-0000-0000-0000-000000000000	5cc7c10f-bc6c-48ef-9a2b-316ed5c535bd	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:03:07.181457+00	
00000000-0000-0000-0000-000000000000	7bd5a702-b22b-4f4e-b887-a03802a5eed9	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:38:07.020469+00	
00000000-0000-0000-0000-000000000000	3a0a6613-bf9a-4d60-891e-383e5a8ae4ca	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:38:07.033573+00	
00000000-0000-0000-0000-000000000000	85c52ac4-6621-442f-a976-2ec60d4e2647	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:02:07.03508+00	
00000000-0000-0000-0000-000000000000	b672f4e6-6409-4d70-a285-6b7b8d801121	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:02:07.043891+00	
00000000-0000-0000-0000-000000000000	38889a4e-99d4-4a06-8a82-025cf9e9b858	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:37:06.942769+00	
00000000-0000-0000-0000-000000000000	d49cfbae-9896-4eb0-bf47-924d787175c1	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:37:06.958607+00	
00000000-0000-0000-0000-000000000000	62f4accf-ff4f-48f2-851b-7d860de17c05	{"action":"login","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 17:25:01.618577+00	
00000000-0000-0000-0000-000000000000	d43e2c59-6927-4417-887e-37649cb95096	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 17:34:13.070998+00	
00000000-0000-0000-0000-000000000000	4e34a16c-4107-4867-9d38-cfcd8300603a	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 17:34:13.080644+00	
00000000-0000-0000-0000-000000000000	36caa6f4-7467-42ca-afe1-91cd622537ca	{"action":"token_refreshed","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 17:35:53.375129+00	
00000000-0000-0000-0000-000000000000	6bc04bb3-27b4-4cb8-8717-cf196c23de2e	{"action":"token_revoked","actor_id":"c3841217-3283-4b45-bb03-3cb7e059b5e5","actor_name":"Ade Maryadi","actor_username":"ade.maryadi.stefanus@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 17:35:53.375986+00	
\.


--
-- TOC entry 4703 (class 0 OID 16925)
-- Dependencies: 268
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- TOC entry 4694 (class 0 OID 16723)
-- Dependencies: 259
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
82005f7d-33a7-4119-8262-8ca6ba11d099	82005f7d-33a7-4119-8262-8ca6ba11d099	{"sub": "82005f7d-33a7-4119-8262-8ca6ba11d099", "email": "fredycurs22@gmail.com", "phone": "+628158882505", "full_name": "Fredy Curs", "company_name": "Sibling", "email_verified": true, "phone_verified": false}	email	2025-09-06 09:58:23.794046+00	2025-09-06 09:58:23.794105+00	2025-09-06 09:58:23.794105+00	672ba0ae-ce1b-43d3-87ee-24e87265a0f7
4e7af1b9-537b-4574-a2db-05fd55bc1824	4e7af1b9-537b-4574-a2db-05fd55bc1824	{"sub": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "email": "alvinoa35@gmail.com", "phone": "0812736327222", "full_name": "Testing2", "company_name": "Biznet", "email_verified": true, "phone_verified": false}	email	2025-09-06 10:03:37.415023+00	2025-09-06 10:03:37.415093+00	2025-09-06 10:03:37.415093+00	d6e2db20-ffe8-47dc-9986-57c3400aafcd
23900513-e747-4788-a1d5-5c77bca39c25	23900513-e747-4788-a1d5-5c77bca39c25	{"sub": "23900513-e747-4788-a1d5-5c77bca39c25", "email": "dbstorages2@gmail.com", "phone": "+628158882505", "full_name": "Testing2", "company_name": "Devoo", "email_verified": true, "phone_verified": false}	email	2025-09-06 14:11:56.556538+00	2025-09-06 14:11:56.556594+00	2025-09-06 14:11:56.556594+00	3f652a79-b9fe-4b12-99b6-ae62ad7c65b1
a822f3d9-4d83-4827-b3e3-7b2aec2d4999	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	{"sub": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "email": "dev.ademaryadi@gmail.com", "phone": "+6285640718785", "full_name": "Stefanus Ade Maryadi", "company_name": "BCT", "email_verified": false, "phone_verified": false}	email	2025-09-09 15:24:41.362004+00	2025-09-09 15:24:41.362065+00	2025-09-09 15:24:41.362065+00	b3fb57e7-1660-4520-ab74-3b49d8501547
a0a88d79-bcbc-46c6-ab50-c671ab894d97	a0a88d79-bcbc-46c6-ab50-c671ab894d97	{"sub": "a0a88d79-bcbc-46c6-ab50-c671ab894d97", "email": "am.ademaryadi.bct@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-09-10 05:49:39.573785+00	2025-09-10 05:49:39.573847+00	2025-09-10 05:49:39.573847+00	54e6a7a1-d35a-4f4b-9dd9-b0ace4e02670
\.


--
-- TOC entry 4688 (class 0 OID 16516)
-- Dependencies: 250
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4698 (class 0 OID 16812)
-- Dependencies: 263
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
c0619dd7-7587-4e53-b8d8-95cf1b95a30d	2025-09-10 10:19:52.844102+00	2025-09-10 10:19:52.844102+00	password	26122a67-9934-4747-a313-ff04967c8835
391428d5-caab-48ce-9877-6dc175667288	2025-09-12 00:34:10.872203+00	2025-09-12 00:34:10.872203+00	password	0cd6e926-16a4-4bba-930e-75fcbdce0cf2
52930368-cf89-4991-8e89-cf248d79219e	2025-09-12 02:48:45.74668+00	2025-09-12 02:48:45.74668+00	password	8c0c61ce-56e9-4680-ac85-5508b2ac8270
2cb78f75-9463-4520-b51b-3544157b2635	2025-09-12 05:05:08.731096+00	2025-09-12 05:05:08.731096+00	password	3e984286-c50f-4059-863e-338e3788a8c0
003159fe-e6d5-4d0a-a620-1a2373cb4930	2025-09-12 05:12:57.965013+00	2025-09-12 05:12:57.965013+00	password	6b83fcf6-e274-497d-92e2-4c5be6852ce7
bba50ecf-9f68-493d-b4f3-cf23e2bff38c	2025-09-12 17:25:01.687056+00	2025-09-12 17:25:01.687056+00	password	dc5dad9f-8cde-41b9-ba19-227be8121580
7b902843-e91f-42d1-9c19-bae750298b55	2025-09-06 19:36:46.436895+00	2025-09-06 19:36:46.436895+00	password	ef6eea08-23ad-4e96-93a0-0c800c81e6df
7915e49b-a8fa-4934-a411-1ad65b2a4136	2025-09-09 15:46:20.458737+00	2025-09-09 15:46:20.458737+00	password	000f670a-e3b1-41e5-a985-f5be5f344576
\.


--
-- TOC entry 4697 (class 0 OID 16800)
-- Dependencies: 262
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- TOC entry 4696 (class 0 OID 16787)
-- Dependencies: 261
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- TOC entry 4746 (class 0 OID 49487)
-- Dependencies: 315
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 4704 (class 0 OID 16975)
-- Dependencies: 269
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
f5d309e3-f9cf-4b58-8400-87595003a5fe	a0a88d79-bcbc-46c6-ab50-c671ab894d97	confirmation_token	7782571c3c6aa700e5a782d08830ea4dceb4b5b2bb61966f42c67660	am.ademaryadi.bct@gmail.com	2025-09-10 05:49:40.139823	2025-09-10 05:49:40.139823
\.


--
-- TOC entry 4687 (class 0 OID 16505)
-- Dependencies: 249
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	422	amf7ousyssyg	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 09:09:07.272165+00	2025-09-12 10:08:07.264878+00	wec3ht5kljm6	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	423	4zft7yu5ubaj	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 09:44:07.253422+00	2025-09-12 10:43:07.305434+00	fqxlqwitmydf	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	424	hqdjmepqozoi	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 10:08:07.279265+00	2025-09-12 11:07:07.111989+00	amf7ousyssyg	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	348	hfudpolqld7g	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	t	2025-09-09 15:46:20.431153+00	2025-09-09 16:44:24.793004+00	\N	7915e49b-a8fa-4934-a411-1ad65b2a4136
00000000-0000-0000-0000-000000000000	349	ezgtsvojvr45	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	t	2025-09-09 16:44:24.810321+00	2025-09-09 17:43:07.509607+00	hfudpolqld7g	7915e49b-a8fa-4934-a411-1ad65b2a4136
00000000-0000-0000-0000-000000000000	350	i6fo4uw362zy	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	f	2025-09-09 17:43:07.526911+00	2025-09-09 17:43:07.526911+00	ezgtsvojvr45	7915e49b-a8fa-4934-a411-1ad65b2a4136
00000000-0000-0000-0000-000000000000	425	bqplvwmovsxb	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 10:43:07.323321+00	2025-09-12 11:42:07.176341+00	4zft7yu5ubaj	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	426	xucgwbccf5re	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 11:07:07.126848+00	2025-09-12 12:06:07.118863+00	hqdjmepqozoi	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	427	lxwwhvjalgqc	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 11:42:07.191096+00	2025-09-12 12:41:07.13895+00	bqplvwmovsxb	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	428	my35gnjxhrq6	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 12:06:07.131569+00	2025-09-12 13:05:07.114757+00	xucgwbccf5re	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	429	we4zyaqg2soc	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 12:41:07.150325+00	2025-09-12 13:40:07.27823+00	lxwwhvjalgqc	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	430	7p4jze6au2tg	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 13:05:07.126507+00	2025-09-12 14:04:07.253629+00	my35gnjxhrq6	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	431	b3clc6rgq2la	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 13:40:07.2869+00	2025-09-12 14:39:07.195145+00	we4zyaqg2soc	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	432	o77l47gawg3p	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 14:04:07.26656+00	2025-09-12 15:03:07.18367+00	7p4jze6au2tg	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	433	2reovl7c5npi	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 14:39:07.202809+00	2025-09-12 15:38:07.034902+00	b3clc6rgq2la	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	434	2ryitwvpabrz	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 15:03:07.194243+00	2025-09-12 16:02:07.044969+00	o77l47gawg3p	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	435	veg7i7fdfqfd	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 15:38:07.046897+00	2025-09-12 16:37:06.959789+00	2reovl7c5npi	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	438	vmsntivwwzuv	c3841217-3283-4b45-bb03-3cb7e059b5e5	f	2025-09-12 17:25:01.655831+00	2025-09-12 17:25:01.655831+00	\N	bba50ecf-9f68-493d-b4f3-cf23e2bff38c
00000000-0000-0000-0000-000000000000	436	75vcylogkmgc	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 16:02:07.050976+00	2025-09-12 17:34:13.081268+00	2ryitwvpabrz	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	373	73c2tiou7ehn	82005f7d-33a7-4119-8262-8ca6ba11d099	f	2025-09-10 10:19:52.824312+00	2025-09-10 10:19:52.824312+00	\N	c0619dd7-7587-4e53-b8d8-95cf1b95a30d
00000000-0000-0000-0000-000000000000	439	csrsziv5gr3d	c3841217-3283-4b45-bb03-3cb7e059b5e5	f	2025-09-12 17:34:13.09308+00	2025-09-12 17:34:13.09308+00	75vcylogkmgc	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	437	jfhcbfbcf75b	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 16:37:06.980734+00	2025-09-12 17:35:53.37773+00	veg7i7fdfqfd	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	440	vizxxju2zlzg	c3841217-3283-4b45-bb03-3cb7e059b5e5	f	2025-09-12 17:35:53.379098+00	2025-09-12 17:35:53.379098+00	jfhcbfbcf75b	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	407	r3c2k67jiidw	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 00:34:10.845051+00	2025-09-12 01:32:33.612267+00	\N	391428d5-caab-48ce-9877-6dc175667288
00000000-0000-0000-0000-000000000000	408	khgsbcbyry2j	c3841217-3283-4b45-bb03-3cb7e059b5e5	f	2025-09-12 01:32:33.630495+00	2025-09-12 01:32:33.630495+00	r3c2k67jiidw	391428d5-caab-48ce-9877-6dc175667288
00000000-0000-0000-0000-000000000000	337	uhou2yijkmzv	82005f7d-33a7-4119-8262-8ca6ba11d099	t	2025-09-06 19:36:46.4342+00	2025-09-06 20:34:57.811048+00	\N	7b902843-e91f-42d1-9c19-bae750298b55
00000000-0000-0000-0000-000000000000	339	lzslv7t534ge	82005f7d-33a7-4119-8262-8ca6ba11d099	t	2025-09-06 20:34:57.811437+00	2025-09-12 02:01:00.174259+00	uhou2yijkmzv	7b902843-e91f-42d1-9c19-bae750298b55
00000000-0000-0000-0000-000000000000	409	73zeojj4aqo7	82005f7d-33a7-4119-8262-8ca6ba11d099	f	2025-09-12 02:01:00.193382+00	2025-09-12 02:01:00.193382+00	lzslv7t534ge	7b902843-e91f-42d1-9c19-bae750298b55
00000000-0000-0000-0000-000000000000	410	jldimp3p27fk	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 02:48:45.692008+00	2025-09-12 03:48:07.573252+00	\N	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	411	ghn6fbb2hwib	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 03:48:07.582264+00	2025-09-12 04:47:07.579701+00	jldimp3p27fk	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	413	h5ubdwkgkb36	c3841217-3283-4b45-bb03-3cb7e059b5e5	f	2025-09-12 05:05:08.699773+00	2025-09-12 05:05:08.699773+00	\N	2cb78f75-9463-4520-b51b-3544157b2635
00000000-0000-0000-0000-000000000000	412	ayy2obrq2abh	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 04:47:07.599585+00	2025-09-12 05:46:07.316285+00	ghn6fbb2hwib	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	414	atdww66vyiyf	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 05:12:57.953814+00	2025-09-12 06:12:07.499317+00	\N	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	415	gc45yp4w7eze	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 05:46:07.331356+00	2025-09-12 06:45:07.412529+00	ayy2obrq2abh	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	416	o7ozxksyv7yx	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 06:12:07.508372+00	2025-09-12 07:11:07.317315+00	atdww66vyiyf	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	417	qurmyohtx5vl	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 06:45:07.420967+00	2025-09-12 07:45:47.933938+00	gc45yp4w7eze	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	418	a2swsb7d7frk	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 07:11:07.329979+00	2025-09-12 08:10:08.259984+00	o7ozxksyv7yx	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	419	kay27hlpwgwl	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 07:45:47.942906+00	2025-09-12 08:45:07.320286+00	qurmyohtx5vl	52930368-cf89-4991-8e89-cf248d79219e
00000000-0000-0000-0000-000000000000	420	wec3ht5kljm6	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 08:10:08.270052+00	2025-09-12 09:09:07.260911+00	a2swsb7d7frk	003159fe-e6d5-4d0a-a620-1a2373cb4930
00000000-0000-0000-0000-000000000000	421	fqxlqwitmydf	c3841217-3283-4b45-bb03-3cb7e059b5e5	t	2025-09-12 08:45:07.329007+00	2025-09-12 09:44:07.247857+00	kay27hlpwgwl	52930368-cf89-4991-8e89-cf248d79219e
\.


--
-- TOC entry 4701 (class 0 OID 16854)
-- Dependencies: 266
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- TOC entry 4702 (class 0 OID 16872)
-- Dependencies: 267
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- TOC entry 4690 (class 0 OID 16531)
-- Dependencies: 252
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
\.


--
-- TOC entry 4695 (class 0 OID 16753)
-- Dependencies: 260
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
49ea0e5a-d500-4ff5-a7e7-b0fc839e125d	bd566177-f856-498e-a555-0358b900919f	2025-08-20 04:21:33.918057+00	2025-08-20 06:29:59.470124+00	\N	aal1	\N	2025-08-20 06:29:59.470048	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15	122.144.3.157	\N
391428d5-caab-48ce-9877-6dc175667288	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-09-12 00:34:10.835213+00	2025-09-12 01:32:33.646987+00	\N	aal1	\N	2025-09-12 01:32:33.646908	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	103.111.250.179	\N
7915e49b-a8fa-4934-a411-1ad65b2a4136	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	2025-09-09 15:46:20.419946+00	2025-09-09 17:43:07.544498+00	\N	aal1	\N	2025-09-09 17:43:07.544407	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	124.158.189.115	\N
7b902843-e91f-42d1-9c19-bae750298b55	82005f7d-33a7-4119-8262-8ca6ba11d099	2025-09-06 19:36:46.432708+00	2025-09-12 02:01:00.204496+00	\N	aal1	\N	2025-09-12 02:01:00.204409	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0	103.111.250.179	\N
2cb78f75-9463-4520-b51b-3544157b2635	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-09-12 05:05:08.68662+00	2025-09-12 05:05:08.68662+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/121.0.0.0	124.158.189.115	\N
bba50ecf-9f68-493d-b4f3-cf23e2bff38c	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-09-12 17:25:01.639684+00	2025-09-12 17:25:01.639684+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	124.158.189.115	\N
003159fe-e6d5-4d0a-a620-1a2373cb4930	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-09-12 05:12:57.949382+00	2025-09-12 17:34:13.110789+00	\N	aal1	\N	2025-09-12 17:34:13.110705	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/121.0.0.0	124.158.189.115	\N
52930368-cf89-4991-8e89-cf248d79219e	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-09-12 02:48:45.670066+00	2025-09-12 17:35:53.384945+00	\N	aal1	\N	2025-09-12 17:35:53.384287	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/121.0.0.0	124.158.189.115	\N
c0619dd7-7587-4e53-b8d8-95cf1b95a30d	82005f7d-33a7-4119-8262-8ca6ba11d099	2025-09-10 10:19:52.817773+00	2025-09-10 10:19:52.817773+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	103.111.250.179	\N
\.


--
-- TOC entry 4700 (class 0 OID 16839)
-- Dependencies: 265
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4699 (class 0 OID 16830)
-- Dependencies: 264
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- TOC entry 4685 (class 0 OID 16493)
-- Dependencies: 247
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	23900513-e747-4788-a1d5-5c77bca39c25	authenticated	authenticated	dbstorages2@gmail.com	$2a$10$Nb0isIYzFUFxAnrD3Ws/U.lURkUglBSMns4P/XHTsF2oPv1MxjEwe	2025-09-06 14:17:13.376283+00	\N		2025-09-06 14:11:56.580666+00		\N			\N	2025-09-06 14:33:19.708289+00	{"provider": "email", "providers": ["email"]}	{"sub": "23900513-e747-4788-a1d5-5c77bca39c25", "email": "dbstorages2@gmail.com", "phone": "+628158882505", "full_name": "Testing2", "company_name": "Devoo", "email_verified": true, "phone_verified": false}	\N	2025-09-06 14:11:56.493383+00	2025-09-06 14:33:19.711161+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bd566177-f856-498e-a555-0358b900919f	authenticated	authenticated	aozpoooyan@gmail.com	$2a$10$7XYoDVj4L6ItqfaZC7mnxuj5V1u9aStEzpbJ4uUjX5RrJllk7aF2i	2025-08-20 04:11:42.074177+00	\N		2025-08-20 04:10:49.755606+00		\N			\N	2025-08-20 04:21:33.917979+00	{"provider": "email", "providers": ["email"]}	{"sub": "bd566177-f856-498e-a555-0358b900919f", "email": "aozpoooyan@gmail.com", "phone": "+6209998891999", "full_name": "Ghani", "company_name": "Ghani Putra Persada", "email_verified": true, "phone_verified": false}	\N	2025-08-20 04:10:49.749474+00	2025-08-20 06:29:59.4674+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f554600d-68eb-4893-a035-b1b3121fccce	authenticated	authenticated	agus.suripto170895@gmail.com	$2a$10$wF0/u.aUH2mDUFOWLm8uxeQfVJ0btyGz0ldrcl/Y7wTTw6gfFVt0K	2025-08-20 07:18:14.223501+00	\N		2025-08-20 07:17:53.61697+00		\N			\N	2025-08-20 07:19:26.754766+00	{"provider": "email", "providers": ["email"]}	{"sub": "f554600d-68eb-4893-a035-b1b3121fccce", "email": "agus.suripto170895@gmail.com", "phone": "080009989867", "full_name": "Agus S", "company_name": "PT Jaringan", "email_verified": true, "phone_verified": false}	\N	2025-08-20 07:17:53.603401+00	2025-08-20 08:17:30.883764+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4e7af1b9-537b-4574-a2db-05fd55bc1824	authenticated	authenticated	alvinoa35@gmail.com	$2a$10$2INzbPOvQwwTszPSz2aQT.UiKjhQWr9kAIDtTOmuK4Yc7JB8M1RPW	2025-09-06 10:03:53.821557+00	\N		2025-09-06 10:03:37.43251+00		\N			\N	2025-09-06 14:43:35.969664+00	{"provider": "email", "providers": ["email"]}	{"sub": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "email": "alvinoa35@gmail.com", "phone": "0812736327222", "full_name": "Testing2", "company_name": "Biznet", "email_verified": true, "phone_verified": false}	\N	2025-09-06 10:03:37.335667+00	2025-09-06 14:43:35.971346+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	82005f7d-33a7-4119-8262-8ca6ba11d099	authenticated	authenticated	fredycurs22@gmail.com	$2a$10$FNL3yIMILbtRSjkNKFmA/O6OzFsRfeJyc7E32j82YPSheZy5W2BXS	2025-09-06 10:01:54.392517+00	\N		2025-09-06 09:58:23.798567+00		\N			\N	2025-09-10 10:19:52.816722+00	{"provider": "email", "providers": ["email"]}	{"sub": "82005f7d-33a7-4119-8262-8ca6ba11d099", "email": "fredycurs22@gmail.com", "phone": "+628158882505", "full_name": "Fredy Curs", "company_name": "Sibling", "email_verified": true, "phone_verified": false}	\N	2025-09-06 09:58:23.788983+00	2025-09-12 02:01:00.198897+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	authenticated	authenticated	dev.ademaryadi@gmail.com	$2a$10$YgDjd2c9ytj1NlcIqNRss.LDvK/TNKVWQCxciDSVs3.xe.HBY8/XW	2025-09-09 15:24:41.365695+00	\N		\N		\N			\N	2025-09-09 15:46:20.41985+00	{"provider": "email", "providers": ["email"]}	{"sub": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "email": "dev.ademaryadi@gmail.com", "phone": "+6285640718785", "full_name": "Stefanus Ade Maryadi", "company_name": "BCT", "email_verified": true, "phone_verified": false}	\N	2025-09-09 15:24:41.353563+00	2025-09-09 17:43:07.535383+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a0a88d79-bcbc-46c6-ab50-c671ab894d97	authenticated	authenticated	am.ademaryadi.bct@gmail.com	$2a$10$w8jFG58sLp1y4GTI6gLNqeMyxPbIqFOf9flPhVXSvX/F6q2STdM2C	\N	\N	7782571c3c6aa700e5a782d08830ea4dceb4b5b2bb61966f42c67660	2025-09-10 05:49:40.129407+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"full_name": "Ade Maryadi", "maksud_tujuan": "Testing purpose"}	\N	2025-09-10 05:49:39.529496+00	2025-09-10 05:49:40.133216+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c3841217-3283-4b45-bb03-3cb7e059b5e5	authenticated	authenticated	ade.maryadi.stefanus@gmail.com	$2a$10$/rTcI7SSunl5uK2LZnAENefiB8KoAjKE9c.KzO3QmaxsRTMFMOnya	2025-08-04 22:21:24.727006+00	\N		2025-08-04 22:20:51.764845+00		\N			\N	2025-09-12 17:25:01.639563+00	{"provider": "email", "providers": ["email"]}	{"sub": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "email": "ade.maryadi.stefanus@gmail.com", "phone": "08158882505", "full_name": "Ade Maryadi", "company_name": "BCT", "email_verified": true, "phone_verified": false}	\N	2025-08-04 22:20:51.74048+00	2025-09-12 17:35:53.381831+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- TOC entry 4739 (class 0 OID 46014)
-- Dependencies: 308
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 4727 (class 0 OID 18930)
-- Dependencies: 296
-- Data for Name: api_integration_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_integration_logs (id, user_id, api_name, request_data, response_data, status, response_time_ms, error_message, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4737 (class 0 OID 45986)
-- Dependencies: 306
-- Data for Name: application_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_documents (id, application_id, document_name, file_path, file_size, mime_type, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- TOC entry 4738 (class 0 OID 46000)
-- Dependencies: 307
-- Data for Name: application_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_evaluations (id, application_id, evaluator_id, evaluator_role, status, comments, decision, evaluated_at) FROM stdin;
\.


--
-- TOC entry 4745 (class 0 OID 47247)
-- Dependencies: 314
-- Data for Name: application_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_workflow (id, application_id, current_step, workflow_role, assigned_to, step_completed_at, step_notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4726 (class 0 OID 18915)
-- Dependencies: 295
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
18627acb-a608-48f8-a951-12f1e7dc3591	\N	INSERT	user_roles	a3b4ea5b-71c5-43da-9eed-f12cb9c9a748	\N	{"id": "a3b4ea5b-71c5-43da-9eed-f12cb9c9a748", "role": "super_admin", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "created_at": "2025-08-06T16:47:31.720082+00:00"}	\N	\N	2025-08-06 16:47:31.720082+00
075954b4-37a8-459d-b34c-7e1e1f29ab81	\N	INSERT	user_roles	216ecb6b-4f79-4ee4-b158-56d2df0bfbe6	\N	{"id": "216ecb6b-4f79-4ee4-b158-56d2df0bfbe6", "role": "guest", "user_id": "bd566177-f856-498e-a555-0358b900919f", "created_at": "2025-08-20T04:10:49.749136+00:00"}	\N	\N	2025-08-20 04:10:49.749136+00
ec2b13f0-f31f-4676-a1dc-c04707949a38	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	216ecb6b-4f79-4ee4-b158-56d2df0bfbe6	{"id": "216ecb6b-4f79-4ee4-b158-56d2df0bfbe6", "role": "guest", "user_id": "bd566177-f856-498e-a555-0358b900919f", "created_at": "2025-08-20T04:10:49.749136+00:00"}	\N	\N	\N	2025-08-20 04:17:04.37772+00
7c3f2a5f-f2a7-4d51-967d-f9c8c1b75649	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	f59f7752-eaa2-4864-a146-ac8917484d2b	\N	{"id": "f59f7752-eaa2-4864-a146-ac8917484d2b", "role": "pelaku_usaha", "user_id": "bd566177-f856-498e-a555-0358b900919f", "created_at": "2025-08-20T04:17:50.969798+00:00"}	\N	\N	2025-08-20 04:17:50.969798+00
5ef9d777-3dae-46bc-b7b0-34fabf234a08	bd566177-f856-498e-a555-0358b900919f	INSERT	telekom_data	6453322b-f38a-47a3-95b6-c7f4ae051e31	\N	{"id": "6453322b-f38a-47a3-95b6-c7f4ae051e31", "region": "Indonesua", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-20T04:41:03.038583+00:00", "created_by": "bd566177-f856-498e-a555-0358b900919f", "updated_at": "2025-08-20T04:41:03.038583+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "Ghani", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2025-08-01", "service_type": "jasa", "license_number": "1111u127361531", "sub_service_id": "5da946d4-6d23-44c0-98bc-15357d5ee170", "sub_service_type": "Multimedia"}	\N	\N	2025-08-20 04:41:03.038583+00
1bbc9276-065e-4b6b-b8dd-4a50b31a4388	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	6453322b-f38a-47a3-95b6-c7f4ae051e31	{"id": "6453322b-f38a-47a3-95b6-c7f4ae051e31", "region": "Indonesua", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-20T04:41:03.038583+00:00", "created_by": "bd566177-f856-498e-a555-0358b900919f", "updated_at": "2025-08-20T04:41:03.038583+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "Ghani", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2025-08-01", "service_type": "jasa", "license_number": "1111u127361531", "sub_service_id": "5da946d4-6d23-44c0-98bc-15357d5ee170", "sub_service_type": "Multimedia"}	{"id": "6453322b-f38a-47a3-95b6-c7f4ae051e31", "region": "Indonesua", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-20T04:41:03.038583+00:00", "created_by": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "updated_at": "2025-08-20T04:46:31.271046+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "Ghani", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2025-08-01", "service_type": "jasa", "license_number": "1111u127361531", "sub_service_id": "5da946d4-6d23-44c0-98bc-15357d5ee170", "sub_service_type": "Multimedia"}	\N	\N	2025-08-20 04:46:31.271046+00
bb5d0849-4ed4-4cb5-97a6-ed3f1504579a	\N	INSERT	user_roles	125ba67a-87ec-4d6a-86be-6b7ca39d8f23	\N	{"id": "125ba67a-87ec-4d6a-86be-6b7ca39d8f23", "role": "guest", "user_id": "f554600d-68eb-4893-a035-b1b3121fccce", "created_at": "2025-08-20T07:17:53.603073+00:00"}	\N	\N	2025-08-20 07:17:53.603073+00
af5febbd-75eb-4df4-9719-8ab127566c06	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	125ba67a-87ec-4d6a-86be-6b7ca39d8f23	{"id": "125ba67a-87ec-4d6a-86be-6b7ca39d8f23", "role": "guest", "user_id": "f554600d-68eb-4893-a035-b1b3121fccce", "created_at": "2025-08-20T07:17:53.603073+00:00"}	\N	\N	\N	2025-08-20 07:22:16.681722+00
03821986-525b-4323-bccb-a46c8124b81c	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	3116d68a-cd67-44b6-b38c-85aaf8fd8770	\N	{"id": "3116d68a-cd67-44b6-b38c-85aaf8fd8770", "role": "pelaku_usaha", "user_id": "f554600d-68eb-4893-a035-b1b3121fccce", "created_at": "2025-08-20T07:37:10.452869+00:00"}	\N	\N	2025-08-20 07:37:10.452869+00
6f7cc94f-e3c0-414e-8510-d3a512e0a2c2	f554600d-68eb-4893-a035-b1b3121fccce	INSERT	telekom_data	90ed78f8-453a-43ed-9f79-948d0a58a771	\N	{"id": "90ed78f8-453a-43ed-9f79-948d0a58a771", "region": null, "status": "active", "file_url": null, "latitude": null, "longitude": null, "created_at": "2025-08-20T08:58:22.84645+00:00", "created_by": "f554600d-68eb-4893-a035-b1b3121fccce", "updated_at": "2025-08-20T08:58:22.84645+00:00", "data_source": "manual", "province_id": null, "company_name": "PT jaringan", "kabupaten_id": null, "license_date": null, "service_type": "telekomunikasi_khusus", "license_number": null, "sub_service_id": "d48e8edf-6f5a-4796-947a-c27e42684daf", "sub_service_type": "Penyelenggaraan Telekomunikasi Khusus Lainnya"}	\N	\N	2025-08-20 08:58:22.84645+00
e51ed2e4-80cc-49af-beeb-6aede2f77816	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	895bc601-ef69-447d-a52b-9b3e0cbbd9f4	{"id": "895bc601-ef69-447d-a52b-9b3e0cbbd9f4", "region": "Jakarta", "status": "active", "file_url": null, "latitude": -6.20880000, "longitude": 106.84560000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Telkomsel Jakarta", "kabupaten_id": null, "license_date": "2023-01-15", "service_type": "telekomunikasi_khusus", "license_number": "TLK-2023-001", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	{"id": "895bc601-ef69-447d-a52b-9b3e0cbbd9f4", "region": "Jakarta", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.127451+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "Telkomsel Jakarta", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2023-01-15", "service_type": "telekomunikasi_khusus", "license_number": "TLK-2023-001", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	\N	\N	2025-08-24 23:43:28.127451+00
a08f2e25-b67a-4c3b-8caa-147913f673a0	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	6f36a1c4-8190-4b65-a708-bf800f47bccb	\N	{"id": "6f36a1c4-8190-4b65-a708-bf800f47bccb", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:09:48.990883+00:00"}	\N	\N	2025-09-06 10:09:48.990883+00
ad9f027b-f960-4e01-9564-4a39fe429c26	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	3fb4d1cf-cff7-4942-884f-fa09f6942e37	\N	{"id": "3fb4d1cf-cff7-4942-884f-fa09f6942e37", "role": "super_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:10:13.477119+00:00"}	\N	\N	2025-09-06 10:10:13.477119+00
ac9cc8e9-719c-40d6-8131-421ffe572ac9	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	6f36a1c4-8190-4b65-a708-bf800f47bccb	{"id": "6f36a1c4-8190-4b65-a708-bf800f47bccb", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:09:48.990883+00:00"}	\N	\N	\N	2025-09-06 10:10:22.935123+00
01a90012-c83e-48d1-bfde-ea9c0ba51deb	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	a80a19d3-7054-47cb-9859-dc85addf7a10	{"id": "a80a19d3-7054-47cb-9859-dc85addf7a10", "region": "Surabaya", "status": "active", "file_url": null, "latitude": -7.25750000, "longitude": 112.75210000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Indosat Ooredoo Surabaya", "kabupaten_id": null, "license_date": "2023-02-10", "service_type": "telekomunikasi_khusus", "license_number": "IDO-2023-002", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	{"id": "a80a19d3-7054-47cb-9859-dc85addf7a10", "region": "Surabaya", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.230346+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "Indosat Ooredoo Surabaya", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2023-02-10", "service_type": "telekomunikasi_khusus", "license_number": "IDO-2023-002", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	\N	\N	2025-08-24 23:43:28.230346+00
56b29077-d551-4909-a2da-a8906f231593	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	62dc6105-a92d-4ada-80d6-6c0351c2b2f4	{"id": "62dc6105-a92d-4ada-80d6-6c0351c2b2f4", "region": "Bandung", "status": "active", "file_url": null, "latitude": -6.91750000, "longitude": 107.61910000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "XL Axiata Bandung", "kabupaten_id": null, "license_date": "2023-03-05", "service_type": "telekomunikasi_khusus", "license_number": "XLA-2023-003", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	{"id": "62dc6105-a92d-4ada-80d6-6c0351c2b2f4", "region": "Bandung", "status": "active", "file_url": null, "latitude": -7.00514530, "longitude": 107.55876060, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.322384+00:00", "data_source": "manual", "province_id": "11088c86-0540-4d5e-bd83-60392db02d77", "company_name": "XL Axiata Bandung", "kabupaten_id": "9b7e4404-6618-4218-adaa-edff8dbf6bf4", "license_date": "2023-03-05", "service_type": "telekomunikasi_khusus", "license_number": "XLA-2023-003", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	\N	\N	2025-08-24 23:43:28.322384+00
faea8f77-ac53-4531-9e3b-f3e290539430	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	cb18aa8a-d904-49f3-9754-e6156b47a293	{"id": "cb18aa8a-d904-49f3-9754-e6156b47a293", "region": "Makassar", "status": "active", "file_url": null, "latitude": -5.14770000, "longitude": 119.43270000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Pasifik Satelit Nusantara", "kabupaten_id": null, "license_date": "2023-03-10", "service_type": "isr", "license_number": "PSN-2023-009", "sub_service_id": null, "sub_service_type": "Izin Stasiun Radio"}	{"id": "cb18aa8a-d904-49f3-9754-e6156b47a293", "region": "Makassar", "status": "active", "file_url": null, "latitude": -5.14766510, "longitude": 119.43273140, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.419474+00:00", "data_source": "manual", "province_id": "9fe9c976-554a-4b16-a653-bf6d1ff9e6a1", "company_name": "Pasifik Satelit Nusantara", "kabupaten_id": "51c9f523-f796-4954-98b4-5b37b9af668f", "license_date": "2023-03-10", "service_type": "isr", "license_number": "PSN-2023-009", "sub_service_id": null, "sub_service_type": "Izin Stasiun Radio"}	\N	\N	2025-08-24 23:43:28.419474+00
ba818ee8-c765-4c5a-9693-16aa7b02ea20	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	5f7d6b9f-7c3c-4dc2-bb98-3f7141b2ccb7	{"id": "5f7d6b9f-7c3c-4dc2-bb98-3f7141b2ccb7", "region": "Jakarta", "status": "active", "file_url": null, "latitude": -6.17510000, "longitude": 106.86500000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Biznet Networks", "kabupaten_id": null, "license_date": "2023-01-20", "service_type": "jasa", "license_number": "BIZ-2023-004", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)"}	{"id": "5f7d6b9f-7c3c-4dc2-bb98-3f7141b2ccb7", "region": "Jakarta", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.513919+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "Biznet Networks", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2023-01-20", "service_type": "jasa", "license_number": "BIZ-2023-004", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)"}	\N	\N	2025-08-24 23:43:28.513919+00
ace22f9e-892f-4cd4-97df-d072f09bec76	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	2f539d85-2373-4d30-8c01-3836f79ba51d	{"id": "2f539d85-2373-4d30-8c01-3836f79ba51d", "region": "Jakarta", "status": "active", "file_url": null, "latitude": -6.22970000, "longitude": 106.82610000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "CBN Fiber", "kabupaten_id": null, "license_date": "2023-02-15", "service_type": "jaringan", "license_number": "CBN-2023-005", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik"}	{"id": "2f539d85-2373-4d30-8c01-3836f79ba51d", "region": "Jakarta", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.602486+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "CBN Fiber", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2023-02-15", "service_type": "jaringan", "license_number": "CBN-2023-005", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik"}	\N	\N	2025-08-24 23:43:28.602486+00
9acc7b0b-66e5-4f70-8591-6a0fda109062	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	f671d71e-5f6f-4044-a964-f9eac49e3986	\N	{"id": "f671d71e-5f6f-4044-a964-f9eac49e3986", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:09:52.780754+00:00"}	\N	\N	2025-09-06 10:09:52.780754+00
22f38929-166c-44a9-9d5b-f685100d21ab	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	f671d71e-5f6f-4044-a964-f9eac49e3986	{"id": "f671d71e-5f6f-4044-a964-f9eac49e3986", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:09:52.780754+00:00"}	\N	\N	\N	2025-09-06 10:10:21.783083+00
eae6c103-a3f7-4b44-8002-c07ed3932d76	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	568f2f7d-9f42-4634-a8b2-b6821bb7bb91	\N	{"id": "568f2f7d-9f42-4634-a8b2-b6821bb7bb91", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:12:07.499297+00:00"}	\N	\N	2025-09-06 10:12:07.499297+00
5b5cfba7-487a-464e-a1ab-a3732569c78f	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	3fb4d1cf-cff7-4942-884f-fa09f6942e37	{"id": "3fb4d1cf-cff7-4942-884f-fa09f6942e37", "role": "super_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:10:13.477119+00:00"}	\N	\N	\N	2025-09-06 10:12:08.590166+00
0f7a0973-395a-459a-98c2-5c7da75b78d7	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	f6ac44c5-8037-41ad-8e89-877a2cd9141e	{"id": "f6ac44c5-8037-41ad-8e89-877a2cd9141e", "region": "Yogyakarta", "status": "active", "file_url": null, "latitude": -7.79560000, "longitude": 110.36950000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Telkom Indonesia", "kabupaten_id": null, "license_date": "2023-03-01", "service_type": "jaringan", "license_number": "TLK-2023-006", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Circuit Switched melalui Media Fiber Optik"}	{"id": "f6ac44c5-8037-41ad-8e89-877a2cd9141e", "region": "Yogyakarta", "status": "active", "file_url": null, "latitude": -7.87538490, "longitude": 110.42620880, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.690708+00:00", "data_source": "manual", "province_id": "723f1be8-1c05-4c0c-9acd-a36d559f3b08", "company_name": "Telkom Indonesia", "kabupaten_id": null, "license_date": "2023-03-01", "service_type": "jaringan", "license_number": "TLK-2023-006", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Circuit Switched melalui Media Fiber Optik"}	\N	\N	2025-08-24 23:43:28.690708+00
4be0069f-a663-4feb-a144-f8c06b936d20	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	24e15cab-9046-4ab3-a1b9-4302e5ec1f58	{"id": "24e15cab-9046-4ab3-a1b9-4302e5ec1f58", "region": "Medan", "status": "active", "file_url": null, "latitude": 3.59520000, "longitude": 98.67220000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Smartfren", "kabupaten_id": null, "license_date": "2023-02-20", "service_type": "telekomunikasi_khusus", "license_number": "SMF-2023-008", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	{"id": "24e15cab-9046-4ab3-a1b9-4302e5ec1f58", "region": "Medan", "status": "active", "file_url": null, "latitude": 3.59519560, "longitude": 98.67222270, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.777683+00:00", "data_source": "manual", "province_id": "18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8", "company_name": "Smartfren", "kabupaten_id": "b1727293-bd03-4099-9b06-d33131221685", "license_date": "2023-02-20", "service_type": "telekomunikasi_khusus", "license_number": "SMF-2023-008", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri"}	\N	\N	2025-08-24 23:43:28.777683+00
a9b11db7-6c04-49ae-a7da-0401e13a743c	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	85b6e35b-4776-49a9-b7af-3f9f609397e0	{"id": "85b6e35b-4776-49a9-b7af-3f9f609397e0", "region": "Denpasar", "status": "suspended", "file_url": null, "latitude": -8.67050000, "longitude": 115.21260000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Hughes Network Systems", "kabupaten_id": null, "license_date": "2023-03-15", "service_type": "isr", "license_number": "HNS-2023-010", "sub_service_id": null, "sub_service_type": "Izin Stasiun Radio"}	{"id": "85b6e35b-4776-49a9-b7af-3f9f609397e0", "region": "Denpasar", "status": "suspended", "file_url": null, "latitude": -8.67045820, "longitude": 115.21262930, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.868085+00:00", "data_source": "manual", "province_id": "62a8a7e6-3631-4e71-bab9-b5e486881558", "company_name": "Hughes Network Systems", "kabupaten_id": "3357e945-e7f2-40bf-a67d-0ee52cd28684", "license_date": "2023-03-15", "service_type": "isr", "license_number": "HNS-2023-010", "sub_service_id": null, "sub_service_type": "Izin Stasiun Radio"}	\N	\N	2025-08-24 23:43:28.868085+00
ef49fa49-87a2-48da-a902-44aa93c93514	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	adec8838-8a90-4ae5-baf9-f78a90d000bf	{"id": "adec8838-8a90-4ae5-baf9-f78a90d000bf", "region": "Semarang", "status": "active", "file_url": null, "latitude": -6.96670000, "longitude": 110.41670000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Moratelindo", "kabupaten_id": null, "license_date": "2023-02-25", "service_type": "jasa", "license_number": "MTI-2023-011", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jasa Sistem Komunikasi Data"}	{"id": "adec8838-8a90-4ae5-baf9-f78a90d000bf", "region": "Semarang", "status": "active", "file_url": null, "latitude": -7.14620000, "longitude": 110.49850000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:28.957596+00:00", "data_source": "manual", "province_id": "5ae1fcd8-bcc1-407e-b65b-963088857753", "company_name": "Moratelindo", "kabupaten_id": "e5bf747a-86a1-4952-b499-51368b86bc08", "license_date": "2023-02-25", "service_type": "jasa", "license_number": "MTI-2023-011", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jasa Sistem Komunikasi Data"}	\N	\N	2025-08-24 23:43:28.957596+00
de2b9607-6385-4b51-9d67-3bb3a58073c2	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	d09f4edf-0dff-430d-9bfe-0554cbdeeccc	{"id": "d09f4edf-0dff-430d-9bfe-0554cbdeeccc", "region": "Palembang", "status": "inactive", "file_url": null, "latitude": -2.97610000, "longitude": 104.77540000, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-05T11:02:42.803067+00:00", "data_source": "manual", "province_id": null, "company_name": "Icon Plus", "kabupaten_id": null, "license_date": "2023-01-30", "service_type": "jasa", "license_number": "ICP-2023-012", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)"}	{"id": "d09f4edf-0dff-430d-9bfe-0554cbdeeccc", "region": "Palembang", "status": "inactive", "file_url": null, "latitude": -2.97607350, "longitude": 104.77543070, "created_at": "2025-08-05T10:42:53.114851+00:00", "created_by": null, "updated_at": "2025-08-24T23:43:29.053589+00:00", "data_source": "manual", "province_id": "2baa91fa-924e-413c-bc59-b01cb28d2f2b", "company_name": "Icon Plus", "kabupaten_id": "04e54283-5f67-4b52-a069-ff798feed441", "license_date": "2023-01-30", "service_type": "jasa", "license_number": "ICP-2023-012", "sub_service_id": null, "sub_service_type": "Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)"}	\N	\N	2025-08-24 23:43:29.053589+00
0093d918-ff99-4945-b739-8c9f6234cf03	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	3116d68a-cd67-44b6-b38c-85aaf8fd8770	{"id": "3116d68a-cd67-44b6-b38c-85aaf8fd8770", "role": "pelaku_usaha", "user_id": "f554600d-68eb-4893-a035-b1b3121fccce", "created_at": "2025-08-20T07:37:10.452869+00:00"}	\N	\N	\N	2025-09-01 12:11:10.722726+00
19ec70b2-cc03-4746-817c-bcf337fac438	\N	INSERT	user_roles	e187c889-57ea-4765-be20-e45c45267a2b	\N	{"id": "e187c889-57ea-4765-be20-e45c45267a2b", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T09:58:23.788174+00:00"}	\N	\N	2025-09-06 09:58:23.788174+00
707b8895-23e8-48bc-9470-c44754a6cfee	\N	INSERT	user_roles	ce779ba4-38cf-491e-a1cc-9d1612e7630a	\N	{"id": "ce779ba4-38cf-491e-a1cc-9d1612e7630a", "role": "guest", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T10:03:37.332868+00:00"}	\N	\N	2025-09-06 10:03:37.332868+00
f8a436c6-6914-42f4-ac73-61c0037b12ff	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	e187c889-57ea-4765-be20-e45c45267a2b	{"id": "e187c889-57ea-4765-be20-e45c45267a2b", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T09:58:23.788174+00:00"}	\N	\N	\N	2025-09-06 10:06:46.556313+00
d1274db0-9fcd-4cd2-b171-60e1df70a37b	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	telekom_data	1c9373f9-27b8-428f-b026-8c5d17be05e4	\N	{"id": "1c9373f9-27b8-428f-b026-8c5d17be05e4", "region": "Indonesia", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T10:32:44.120774+00:00", "created_by": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "updated_at": "2025-09-06T10:32:44.120774+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "Sibling", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-06", "service_type": "jaringan", "license_number": "2342", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	\N	\N	2025-09-06 10:32:44.120774+00
b0b9e48a-8f4d-42b2-b149-24062b414bc9	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	telekom_data	1c9373f9-27b8-428f-b026-8c5d17be05e4	{"id": "1c9373f9-27b8-428f-b026-8c5d17be05e4", "region": "Indonesia", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T10:32:44.120774+00:00", "created_by": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "updated_at": "2025-09-06T10:32:44.120774+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "Sibling", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-06", "service_type": "jaringan", "license_number": "2342", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	{"id": "1c9373f9-27b8-428f-b026-8c5d17be05e4", "region": "Indonesia", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T10:32:44.120774+00:00", "created_by": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "updated_at": "2025-09-06T10:33:16.578695+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "PT Sibling", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-06", "service_type": "jaringan", "license_number": "2342", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	\N	\N	2025-09-06 10:33:16.578695+00
0678cf02-d02c-4667-bae1-fbe3282be92d	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	telekom_data	1c9373f9-27b8-428f-b026-8c5d17be05e4	{"id": "1c9373f9-27b8-428f-b026-8c5d17be05e4", "region": "Indonesia", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T10:32:44.120774+00:00", "created_by": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "updated_at": "2025-09-06T10:33:16.578695+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "PT Sibling", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-06", "service_type": "jaringan", "license_number": "2342", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	\N	\N	\N	2025-09-06 10:33:24.153209+00
4bcc150a-9fb3-4fb2-a1f1-c50bcd9e4bc1	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	tickets	04255b08-16d6-4c87-b168-9587a273a38f	{"id": "04255b08-16d6-4c87-b168-9587a273a38f", "tags": null, "title": "test", "status": "open", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "category": "general", "due_date": null, "file_url": null, "priority": "high", "created_at": "2025-08-04T23:11:50.429643+00:00", "updated_at": "2025-08-05T01:55:44.902826+00:00", "assigned_to": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "description": "test", "resolved_at": null, "escalated_at": null, "internal_notes": null, "escalation_level": 0, "assignment_status": "assigned", "first_response_at": null}	{"id": "04255b08-16d6-4c87-b168-9587a273a38f", "tags": null, "title": "test", "status": "open", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "category": "general", "due_date": null, "file_url": null, "priority": "high", "created_at": "2025-08-04T23:11:50.429643+00:00", "updated_at": "2025-09-06T10:49:31.348647+00:00", "assigned_to": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "description": "test", "resolved_at": null, "escalated_at": null, "internal_notes": null, "escalation_level": 0, "assignment_status": "assigned", "first_response_at": null}	\N	\N	2025-09-06 10:49:31.348647+00
9df05f4f-b279-44ae-b026-b29feeb73463	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	tickets	04255b08-16d6-4c87-b168-9587a273a38f	{"id": "04255b08-16d6-4c87-b168-9587a273a38f", "tags": null, "title": "test", "status": "open", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "category": "general", "due_date": null, "file_url": null, "priority": "high", "created_at": "2025-08-04T23:11:50.429643+00:00", "updated_at": "2025-09-06T10:49:31.348647+00:00", "assigned_to": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "description": "test", "resolved_at": null, "escalated_at": null, "internal_notes": null, "escalation_level": 0, "assignment_status": "assigned", "first_response_at": null}	{"id": "04255b08-16d6-4c87-b168-9587a273a38f", "tags": null, "title": "test", "status": "open", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "category": "general", "due_date": null, "file_url": null, "priority": "high", "created_at": "2025-08-04T23:11:50.429643+00:00", "updated_at": "2025-09-06T10:51:12.696291+00:00", "assigned_to": null, "description": "test", "resolved_at": null, "escalated_at": null, "internal_notes": null, "escalation_level": 0, "assignment_status": "unassigned", "first_response_at": null}	\N	\N	2025-09-06 10:51:12.696291+00
bf6252b8-5375-41fd-8018-9b596254d249	c3841217-3283-4b45-bb03-3cb7e059b5e5	UPDATE	tickets	04255b08-16d6-4c87-b168-9587a273a38f	{"id": "04255b08-16d6-4c87-b168-9587a273a38f", "tags": null, "title": "test", "status": "open", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "category": "general", "due_date": null, "file_url": null, "priority": "high", "created_at": "2025-08-04T23:11:50.429643+00:00", "updated_at": "2025-09-06T10:51:12.696291+00:00", "assigned_to": null, "description": "test", "resolved_at": null, "escalated_at": null, "internal_notes": null, "escalation_level": 0, "assignment_status": "unassigned", "first_response_at": null}	{"id": "04255b08-16d6-4c87-b168-9587a273a38f", "tags": null, "title": "test", "status": "open", "user_id": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "category": "general", "due_date": null, "file_url": null, "priority": "medium", "created_at": "2025-08-04T23:11:50.429643+00:00", "updated_at": "2025-09-06T10:52:09.747511+00:00", "assigned_to": null, "description": "test", "resolved_at": null, "escalated_at": null, "internal_notes": null, "escalation_level": 0, "assignment_status": "unassigned", "first_response_at": null}	\N	\N	2025-09-06 10:52:09.747511+00
bca3e2cb-99e4-4756-a030-31e477ffe6c3	\N	INSERT	user_roles	b9643cc4-9ebd-4783-949c-181fb22adca2	\N	{"id": "b9643cc4-9ebd-4783-949c-181fb22adca2", "role": "guest", "user_id": "23900513-e747-4788-a1d5-5c77bca39c25", "created_at": "2025-09-06T14:11:56.49185+00:00"}	\N	\N	2025-09-06 14:11:56.49185+00
97ef51d5-d2c5-4c2e-9f3d-64f79bd96543	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	ce779ba4-38cf-491e-a1cc-9d1612e7630a	{"id": "ce779ba4-38cf-491e-a1cc-9d1612e7630a", "role": "guest", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T10:03:37.332868+00:00"}	\N	\N	\N	2025-09-06 14:18:58.889827+00
d794ff89-e3b5-40fe-89b2-fd311cce0b4c	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	b9643cc4-9ebd-4783-949c-181fb22adca2	{"id": "b9643cc4-9ebd-4783-949c-181fb22adca2", "role": "guest", "user_id": "23900513-e747-4788-a1d5-5c77bca39c25", "created_at": "2025-09-06T14:11:56.49185+00:00"}	\N	\N	\N	2025-09-06 14:19:01.673642+00
e525e1b7-5d5c-4155-8d85-3550cc27be45	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	a5e86587-301a-4b71-a29b-d0fa2ebbde7d	\N	{"id": "a5e86587-301a-4b71-a29b-d0fa2ebbde7d", "role": "internal_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:19:16.643978+00:00"}	\N	\N	2025-09-06 14:19:16.643978+00
ad5a5c13-ddf5-410f-a417-b53e7df0cba1	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	f121e7a8-eb81-4445-b328-45bda7e01e8f	\N	{"id": "f121e7a8-eb81-4445-b328-45bda7e01e8f", "role": "pengolah_data", "user_id": "23900513-e747-4788-a1d5-5c77bca39c25", "created_at": "2025-09-06T14:19:26.047773+00:00"}	\N	\N	2025-09-06 14:19:26.047773+00
f5056b83-b493-4209-a0ee-cf061404a191	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	5a2349a8-6712-4c35-9757-ef78a1e4d6f8	\N	{"id": "5a2349a8-6712-4c35-9757-ef78a1e4d6f8", "role": "pelaku_usaha", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:42:53.277673+00:00"}	\N	\N	2025-09-06 14:42:53.277673+00
0d90da35-7e41-4fa1-bb20-1890fa9811a0	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	a5e86587-301a-4b71-a29b-d0fa2ebbde7d	{"id": "a5e86587-301a-4b71-a29b-d0fa2ebbde7d", "role": "internal_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:19:16.643978+00:00"}	\N	\N	\N	2025-09-06 14:42:58.24995+00
bc82a960-429f-410a-9323-d8fcccddbf72	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	470dd951-638d-4328-be7d-4e8b7a3599cb	\N	{"id": "470dd951-638d-4328-be7d-4e8b7a3599cb", "role": "internal_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:44:05.897217+00:00"}	\N	\N	2025-09-06 14:44:05.897217+00
cf9f7d26-e3f9-4110-94f9-f5a63209e788	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	470dd951-638d-4328-be7d-4e8b7a3599cb	{"id": "470dd951-638d-4328-be7d-4e8b7a3599cb", "role": "internal_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:44:05.897217+00:00"}	\N	\N	\N	2025-09-06 14:44:38.223102+00
a050ced1-b468-40c7-9ede-3cda187d3ee4	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	2f85c09e-d28e-4743-a418-eb8462e89070	\N	{"id": "2f85c09e-d28e-4743-a418-eb8462e89070", "role": "internal_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:45:21.547347+00:00"}	\N	\N	2025-09-06 14:45:21.547347+00
cd8f3023-6c03-4196-ad23-4a002bedf35a	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	36369362-1c08-4db7-b870-2cca63b15910	\N	{"id": "36369362-1c08-4db7-b870-2cca63b15910", "role": "super_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:45:38.395655+00:00"}	\N	\N	2025-09-06 14:45:38.395655+00
fe30e735-6485-402e-b9a1-4548ac9ea32c	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	5a2349a8-6712-4c35-9757-ef78a1e4d6f8	{"id": "5a2349a8-6712-4c35-9757-ef78a1e4d6f8", "role": "pelaku_usaha", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:42:53.277673+00:00"}	\N	\N	\N	2025-09-06 14:45:47.630971+00
6906eba3-5b75-492b-9ce7-4710d2f24f27	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	2f85c09e-d28e-4743-a418-eb8462e89070	{"id": "2f85c09e-d28e-4743-a418-eb8462e89070", "role": "internal_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:45:21.547347+00:00"}	\N	\N	\N	2025-09-06 14:45:48.895296+00
3aa21599-0aa1-4782-bc68-5adf8bb65667	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	36369362-1c08-4db7-b870-2cca63b15910	{"id": "36369362-1c08-4db7-b870-2cca63b15910", "role": "super_admin", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:45:38.395655+00:00"}	\N	\N	\N	2025-09-06 14:46:34.145187+00
a155f437-e1c3-4b45-9fd0-fb86c910754e	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	b2d5c3ab-574c-4bba-9896-0ddb7aa6c683	\N	{"id": "b2d5c3ab-574c-4bba-9896-0ddb7aa6c683", "role": "pengolah_data", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:47:03.016919+00:00"}	\N	\N	2025-09-06 14:47:03.016919+00
06a9f883-4627-4733-b6cb-b5fce16faa5a	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	00638101-35ac-4af3-a395-87508664f6db	\N	{"id": "00638101-35ac-4af3-a395-87508664f6db", "role": "pelaku_usaha", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:47:06.932143+00:00"}	\N	\N	2025-09-06 14:47:06.932143+00
5ad612c4-a54b-4191-a1d3-37386b16e124	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	b2d5c3ab-574c-4bba-9896-0ddb7aa6c683	{"id": "b2d5c3ab-574c-4bba-9896-0ddb7aa6c683", "role": "pengolah_data", "user_id": "4e7af1b9-537b-4574-a2db-05fd55bc1824", "created_at": "2025-09-06T14:47:03.016919+00:00"}	\N	\N	\N	2025-09-06 14:47:09.286796+00
2fe88ac2-a93e-4375-9332-041759cfb3ff	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	telekom_data	6453322b-f38a-47a3-95b6-c7f4ae051e31	{"id": "6453322b-f38a-47a3-95b6-c7f4ae051e31", "region": "Indonesua", "status": "active", "file_url": null, "latitude": -6.13520000, "longitude": 106.81330100, "created_at": "2025-08-20T04:41:03.038583+00:00", "created_by": "c3841217-3283-4b45-bb03-3cb7e059b5e5", "updated_at": "2025-08-20T04:46:31.271046+00:00", "data_source": "manual", "province_id": "b7777678-3862-460c-b2d2-76aa1ce3f640", "company_name": "Ghani", "kabupaten_id": "91556806-5e37-4f0c-8b58-5059cebf91fb", "license_date": "2025-08-01", "service_type": "jasa", "license_number": "1111u127361531", "sub_service_id": "5da946d4-6d23-44c0-98bc-15357d5ee170", "sub_service_type": "Multimedia"}	\N	\N	\N	2025-09-06 17:31:37.383005+00
2790d5f5-2045-4793-98b3-06e49e505007	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	66ee5c6c-0b32-43e6-b2bf-20bdf923d1fb	\N	{"id": "66ee5c6c-0b32-43e6-b2bf-20bdf923d1fb", "role": "super_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T19:51:28.309469+00:00"}	\N	\N	2025-09-06 19:51:28.309469+00
ef885061-6233-4853-ad21-803dc884ca2f	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	66ee5c6c-0b32-43e6-b2bf-20bdf923d1fb	{"id": "66ee5c6c-0b32-43e6-b2bf-20bdf923d1fb", "role": "super_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T19:51:28.309469+00:00"}	\N	\N	\N	2025-09-06 19:52:59.133383+00
1fea24bc-f28f-4e6a-bba6-6ae0133434ee	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	07131e71-9bfd-4b14-a6dc-9d38964e0d90	\N	{"id": "07131e71-9bfd-4b14-a6dc-9d38964e0d90", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T19:53:05.958443+00:00"}	\N	\N	2025-09-06 19:53:05.958443+00
d2095639-0661-46a7-83ca-6fb39b16278e	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	568f2f7d-9f42-4634-a8b2-b6821bb7bb91	{"id": "568f2f7d-9f42-4634-a8b2-b6821bb7bb91", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T10:12:07.499297+00:00"}	\N	\N	\N	2025-09-06 19:53:40.579558+00
29b58190-e64f-46ee-9ea5-18dc1a2ee8ad	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	132b0e71-8f99-433f-a08e-e3f5c0c8d25d	\N	{"id": "132b0e71-8f99-433f-a08e-e3f5c0c8d25d", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T19:54:24.158423+00:00"}	\N	\N	2025-09-06 19:54:24.158423+00
a72a60f9-e831-4825-bf54-d46045d7456d	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	07131e71-9bfd-4b14-a6dc-9d38964e0d90	{"id": "07131e71-9bfd-4b14-a6dc-9d38964e0d90", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T19:53:05.958443+00:00"}	\N	\N	\N	2025-09-06 19:54:30.737914+00
5586ddc8-899f-42e7-9ded-12cd172f20ba	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	0989b43a-29bc-4ceb-812a-1c1ce70fd8b2	\N	{"id": "0989b43a-29bc-4ceb-812a-1c1ce70fd8b2", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:02:09.323721+00:00"}	\N	\N	2025-09-06 20:02:09.323721+00
811f4acb-f0db-469e-88dc-abb212e21c3e	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	132b0e71-8f99-433f-a08e-e3f5c0c8d25d	{"id": "132b0e71-8f99-433f-a08e-e3f5c0c8d25d", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T19:54:24.158423+00:00"}	\N	\N	\N	2025-09-06 20:02:14.560265+00
8d4b9d4e-e803-4014-a7dc-e2f6c4c387f6	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	0989b43a-29bc-4ceb-812a-1c1ce70fd8b2	{"id": "0989b43a-29bc-4ceb-812a-1c1ce70fd8b2", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:02:09.323721+00:00"}	\N	\N	\N	2025-09-06 20:02:43.212364+00
0abcf823-8896-4561-a4c6-f5f2d83a6217	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	a64a38d1-2c9e-4650-b69f-1d6e4d1f4177	\N	{"id": "a64a38d1-2c9e-4650-b69f-1d6e4d1f4177", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:03:00.354364+00:00"}	\N	\N	2025-09-06 20:03:00.354364+00
fe54ebbe-eea0-4c7b-a212-41d535eb9d07	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	8038fef1-ff56-441a-a7c2-9c8e55f7c091	\N	{"id": "8038fef1-ff56-441a-a7c2-9c8e55f7c091", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:03:11.502163+00:00"}	\N	\N	2025-09-06 20:03:11.502163+00
776c1b72-1d37-4ce3-9e81-05d9c576093b	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	a64a38d1-2c9e-4650-b69f-1d6e4d1f4177	{"id": "a64a38d1-2c9e-4650-b69f-1d6e4d1f4177", "role": "guest", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:03:00.354364+00:00"}	\N	\N	\N	2025-09-06 20:03:36.500265+00
a210f7c7-e785-4619-9bf2-5204a47ae2b0	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	fdb15476-13eb-40d4-9390-9bb49597b146	\N	{"id": "fdb15476-13eb-40d4-9390-9bb49597b146", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:04:20.418444+00:00"}	\N	\N	2025-09-06 20:04:20.418444+00
7de66356-ad6a-40f4-98dc-3d4cf68208e0	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	8038fef1-ff56-441a-a7c2-9c8e55f7c091	{"id": "8038fef1-ff56-441a-a7c2-9c8e55f7c091", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:03:11.502163+00:00"}	\N	\N	\N	2025-09-06 20:04:22.562605+00
7d719c4b-8df5-480e-b789-ab01584ceba8	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	fdb15476-13eb-40d4-9390-9bb49597b146	{"id": "fdb15476-13eb-40d4-9390-9bb49597b146", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:04:20.418444+00:00"}	\N	\N	\N	2025-09-06 20:07:07.592895+00
3303b079-80be-4b02-a6e3-145f4b9c0c8b	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	29deaab4-02d6-4509-b84b-d92016959b74	\N	{"id": "29deaab4-02d6-4509-b84b-d92016959b74", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:07:15.007185+00:00"}	\N	\N	2025-09-06 20:07:15.007185+00
44644daf-034c-4be4-a94c-7fbe90ed4879	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	d6f8f85e-cc2a-4934-8993-91b7c77ef979	\N	{"id": "d6f8f85e-cc2a-4934-8993-91b7c77ef979", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:07:33.195115+00:00"}	\N	\N	2025-09-06 20:07:33.195115+00
828f5ffd-66de-4418-b920-d983e9c3a036	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	29deaab4-02d6-4509-b84b-d92016959b74	{"id": "29deaab4-02d6-4509-b84b-d92016959b74", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:07:15.007185+00:00"}	\N	\N	\N	2025-09-06 20:07:35.112511+00
d781a93f-dfee-4bb5-a144-db1240df4b6e	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	1f8a84f3-9231-467f-abe9-1c41ac3ae3c2	\N	{"id": "1f8a84f3-9231-467f-abe9-1c41ac3ae3c2", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:18:28.564512+00:00"}	\N	\N	2025-09-06 20:18:28.564512+00
14cfc091-7ea8-4629-98d1-f22dea7f8c82	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	d6f8f85e-cc2a-4934-8993-91b7c77ef979	{"id": "d6f8f85e-cc2a-4934-8993-91b7c77ef979", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:07:33.195115+00:00"}	\N	\N	\N	2025-09-06 20:18:30.154315+00
2eca81a8-a92c-48c0-b156-5ba2eb9ca2f9	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	80ec69ef-6d28-4025-98c1-938850e57420	\N	{"id": "80ec69ef-6d28-4025-98c1-938850e57420", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:19:57.15434+00:00"}	\N	\N	2025-09-06 20:19:57.15434+00
486f2cdb-000f-4bf6-9ab9-75909f44d5a5	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	1f8a84f3-9231-467f-abe9-1c41ac3ae3c2	{"id": "1f8a84f3-9231-467f-abe9-1c41ac3ae3c2", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:18:28.564512+00:00"}	\N	\N	\N	2025-09-06 20:19:58.89467+00
fe7eb212-04bd-45b2-ac48-a85b99ac941c	82005f7d-33a7-4119-8262-8ca6ba11d099	INSERT	telekom_data	f2d17d80-dd08-4b4f-a7c7-28e0c324d892	\N	{"id": "f2d17d80-dd08-4b4f-a7c7-28e0c324d892", "region": "Jawa Timur", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T20:27:15.518266+00:00", "created_by": "82005f7d-33a7-4119-8262-8ca6ba11d099", "updated_at": "2025-09-06T20:27:15.518266+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "PT Sibling", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-07", "service_type": "jaringan", "license_number": "211412", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	\N	\N	2025-09-06 20:27:15.518266+00
b43951d9-c9fd-4bab-be16-c5b627686143	82005f7d-33a7-4119-8262-8ca6ba11d099	UPDATE	telekom_data	f2d17d80-dd08-4b4f-a7c7-28e0c324d892	{"id": "f2d17d80-dd08-4b4f-a7c7-28e0c324d892", "region": "Jawa Timur", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T20:27:15.518266+00:00", "created_by": "82005f7d-33a7-4119-8262-8ca6ba11d099", "updated_at": "2025-09-06T20:27:15.518266+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "PT Sibling", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-07", "service_type": "jaringan", "license_number": "211412", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	{"id": "f2d17d80-dd08-4b4f-a7c7-28e0c324d892", "region": "Jawa Timur", "status": "active", "file_url": null, "latitude": -7.24597170, "longitude": 112.73782660, "created_at": "2025-09-06T20:27:15.518266+00:00", "created_by": "82005f7d-33a7-4119-8262-8ca6ba11d099", "updated_at": "2025-09-06T20:27:28.539803+00:00", "data_source": "manual", "province_id": "af7d45cb-f359-4106-a323-79b6f8368aa7", "company_name": "PT Siblings", "kabupaten_id": "920a6787-9a03-4dd4-84d9-e60ec600a067", "license_date": "2025-09-07", "service_type": "jaringan", "license_number": "211412", "sub_service_id": "429c6fef-dabb-4591-a38e-6deff5d78195", "sub_service_type": "Penyelenggaraan Jaringan Tetap Lokal"}	\N	\N	2025-09-06 20:27:28.539803+00
36033d89-3bf0-48e6-b4a7-fa14a1675413	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	8d9ade17-6439-461b-992a-9117c39d60a6	\N	{"id": "8d9ade17-6439-461b-992a-9117c39d60a6", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:31:46.212489+00:00"}	\N	\N	2025-09-06 20:31:46.212489+00
984366f9-5e1a-47b1-8220-f9c2929cde2f	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	98d1d306-d52b-420e-b9d5-906a3d54597f	\N	{"id": "98d1d306-d52b-420e-b9d5-906a3d54597f", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:31:51.415055+00:00"}	\N	\N	2025-09-06 20:31:51.415055+00
d224443a-0bc0-4aab-b940-64dec250ba65	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	80ec69ef-6d28-4025-98c1-938850e57420	{"id": "80ec69ef-6d28-4025-98c1-938850e57420", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:19:57.15434+00:00"}	\N	\N	\N	2025-09-06 20:31:52.737555+00
4e2e8b3e-51b5-495e-97ce-4d22855f056e	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	8d9ade17-6439-461b-992a-9117c39d60a6	{"id": "8d9ade17-6439-461b-992a-9117c39d60a6", "role": "pelaku_usaha", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:31:46.212489+00:00"}	\N	\N	\N	2025-09-06 20:31:53.74687+00
30069dba-1a67-422a-8048-9008d7b528ce	\N	INSERT	user_roles	ee41bd3d-8e17-4650-926f-a2493285b0c6	\N	{"id": "ee41bd3d-8e17-4650-926f-a2493285b0c6", "role": "guest", "user_id": "aad59621-a875-43d6-b1b5-889fdbd19e52", "created_at": "2025-09-09T15:05:40.987419+00:00"}	\N	\N	2025-09-09 15:05:40.987419+00
8141070a-a2cb-4d75-a54b-8360bcf8ad38	\N	DELETE	user_roles	ee41bd3d-8e17-4650-926f-a2493285b0c6	{"id": "ee41bd3d-8e17-4650-926f-a2493285b0c6", "role": "guest", "user_id": "aad59621-a875-43d6-b1b5-889fdbd19e52", "created_at": "2025-09-09T15:05:40.987419+00:00"}	\N	\N	\N	2025-09-09 15:22:48.173393+00
948d4a9b-173c-4f17-9c0b-da281d00e558	\N	INSERT	user_roles	6c090788-4cba-46a7-a9cf-653d299c29db	\N	{"id": "6c090788-4cba-46a7-a9cf-653d299c29db", "role": "guest", "user_id": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "created_at": "2025-09-09T15:24:41.353231+00:00"}	\N	\N	2025-09-09 15:24:41.353231+00
866aade0-6ea2-43e7-9662-49a4922af1c8	\N	UPDATE	user_roles	6c090788-4cba-46a7-a9cf-653d299c29db	{"id": "6c090788-4cba-46a7-a9cf-653d299c29db", "role": "guest", "user_id": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "created_at": "2025-09-09T15:24:41.353231+00:00"}	{"id": "6c090788-4cba-46a7-a9cf-653d299c29db", "role": "pelaku_usaha", "user_id": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "created_at": "2025-09-09T15:24:41.353231+00:00"}	\N	\N	2025-09-09 15:58:06.428758+00
cd247712-a55a-42da-9e7e-2da1ed8cc5e6	\N	INSERT	user_roles	5e7d8455-a4b7-4f43-ad9b-e57d791ad17d	\N	{"id": "5e7d8455-a4b7-4f43-ad9b-e57d791ad17d", "role": "pelaku_usaha", "user_id": "a0a88d79-bcbc-46c6-ab50-c671ab894d97", "created_at": "2025-09-10T05:49:39.526761+00:00"}	\N	\N	2025-09-10 05:49:39.526761+00
de37d65e-be38-4d5e-ba39-cd8cb28db50e	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	2f64856b-697f-461b-849f-a4fa4131e252	\N	{"id": "2f64856b-697f-461b-849f-a4fa4131e252", "role": "internal_admin", "user_id": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "created_at": "2025-09-10T09:00:13.943579+00:00"}	\N	\N	2025-09-10 09:00:13.943579+00
ee76f450-9b51-404c-a17f-840da2595ab9	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	2f64856b-697f-461b-849f-a4fa4131e252	{"id": "2f64856b-697f-461b-849f-a4fa4131e252", "role": "internal_admin", "user_id": "a822f3d9-4d83-4827-b3e3-7b2aec2d4999", "created_at": "2025-09-10T09:00:13.943579+00:00"}	\N	\N	\N	2025-09-10 09:00:25.23037+00
1a55be6a-820a-4f7a-9ee2-101b9022deb8	c3841217-3283-4b45-bb03-3cb7e059b5e5	INSERT	user_roles	012dd445-f45c-4c58-aa3a-63a044896af7	\N	{"id": "012dd445-f45c-4c58-aa3a-63a044896af7", "role": "internal_admin", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-10T10:19:33.665762+00:00"}	\N	\N	2025-09-10 10:19:33.665762+00
e82e9c85-6545-46f3-90a9-41542a89f856	c3841217-3283-4b45-bb03-3cb7e059b5e5	DELETE	user_roles	98d1d306-d52b-420e-b9d5-906a3d54597f	{"id": "98d1d306-d52b-420e-b9d5-906a3d54597f", "role": "pengolah_data", "user_id": "82005f7d-33a7-4119-8262-8ca6ba11d099", "created_at": "2025-09-06T20:31:51.415055+00:00"}	\N	\N	\N	2025-09-10 10:19:36.502672+00
\.


--
-- TOC entry 4743 (class 0 OID 46081)
-- Dependencies: 312
-- Data for Name: captcha_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.captcha_sessions (id, session_token, answer, created_at, expires_at, used) FROM stdin;
\.


--
-- TOC entry 4733 (class 0 OID 45921)
-- Dependencies: 302
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, company_name, nib, company_address, phone, email, website, business_field, status, created_at, updated_at, verified_at, verified_by, verification_notes, verification_documents, nib_number, npwp_number, company_type, akta_number, province_id, kabupaten_id, kecamatan, kelurahan, postal_code, correction_notes, correction_status) FROM stdin;
b9f564b3-88b6-4fa1-8118-fcbe553c2ef8	Bima Creative	\N	Nayyara 12 Residence	+628158882505	am.ademaryadi.bct@gmail.com	\N	Telekomunikasi	pending_verification	2025-09-10 05:49:39.683926+00	2025-09-10 05:49:39.683926+00	\N	\N	\N	\N	123456718912310	12.345.678.9-012.345	pt	123	b7777678-3862-460c-b2d2-76aa1ce3f640	50648878-a4cb-4aac-9dc1-fce3ea1bdad5	3171.06	3171.06.4	12345	{}	\N
\.


--
-- TOC entry 4749 (class 0 OID 57391)
-- Dependencies: 318
-- Data for Name: company_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_documents (id, company_id, document_type, file_path, file_name, file_size, mime_type, uploaded_by, created_at, updated_at) FROM stdin;
10de68c6-2548-476e-a717-abc6c66cf1c2	b9f564b3-88b6-4fa1-8118-fcbe553c2ef8	nib	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/temp/registration/1757483281305-Business%20Card%20CBS.pdf	nib-document.pdf	0	application/pdf	a0a88d79-bcbc-46c6-ab50-c671ab894d97	2025-09-10 05:49:39.905316+00	2025-09-10 05:49:39.905316+00
98bc5306-9be9-48d5-978c-79d9408e277c	b9f564b3-88b6-4fa1-8118-fcbe553c2ef8	npwp	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/temp/registration/1757483293023-3.%20NIB%20PT%20Grafika%20Tugu%20Indonesia%202025.pdf	npwp-document.pdf	0	application/pdf	a0a88d79-bcbc-46c6-ab50-c671ab894d97	2025-09-10 05:49:39.960167+00	2025-09-10 05:49:39.960167+00
9af40e36-ae56-492b-8ea9-4fa6271c87da	b9f564b3-88b6-4fa1-8118-fcbe553c2ef8	akta	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/temp/registration/1757483298036-4.%20NPWP%20PT%20Grafika%20Tugu%20Indonesia%202025.pdf	akta-document.pdf	0	application/pdf	a0a88d79-bcbc-46c6-ab50-c671ab894d97	2025-09-10 05:49:40.004982+00	2025-09-10 05:49:40.004982+00
\.


--
-- TOC entry 4713 (class 0 OID 17339)
-- Dependencies: 282
-- Data for Name: faq_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faq_categories (id, name, description, created_at) FROM stdin;
1d8e1e30-ce16-4a87-85bd-21af6952d17a	Umum	Pertanyaan umum seputar layanan	2025-08-04 17:14:29.462953+00
51e7c87c-5a8f-4ff4-9ff7-7444d54f26f4	Teknis	Pertanyaan teknis dan troubleshooting	2025-08-04 17:14:29.462953+00
8f2b3989-4eef-4530-b9c5-09f4c510b70c	Administrasi	Pertanyaan seputar administrasi dan dokumentasi	2025-08-04 17:14:29.462953+00
5ee56033-5d7a-4b41-8af1-3c0898cbc659	Perizinan	Pertanyaan seputar perizinan telekomunikasi	2025-08-04 17:14:29.462953+00
696fbb84-8301-4d23-9dba-a5d30542c6b3	Test	\N	2025-08-04 23:15:22.404753+00
\.


--
-- TOC entry 4714 (class 0 OID 17348)
-- Dependencies: 283
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, category_id, question, answer, file_url, is_active, created_at, updated_at) FROM stdin;
61c40843-c8da-45fe-aa75-c9d7f14875cb	8f2b3989-4eef-4530-b9c5-09f4c510b70c	Tes	Uji Coba	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/c3841217-3283-4b45-bb03-3cb7e059b5e5/telekom-data/1757167030595-gemini-for-google-workspace-prompting-guide-101.pdf	t	2025-09-06 11:00:43.066208+00	2025-09-06 13:57:32.399401+00
\.


--
-- TOC entry 4729 (class 0 OID 31239)
-- Dependencies: 298
-- Data for Name: fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fields (id, module_id, name, code, field_type, is_system_field, is_active, created_at, updated_at) FROM stdin;
b8051408-d7cb-4df2-ac83-057790ea9cf9	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Company Name	company_name	text	t	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
e2d218fd-3424-4e45-880b-f442245fc41a	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Service Type	service_type	select	t	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
e5177854-49fb-4da5-a8b3-cdec67638c8a	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Sub Service Type	sub_service_type	text	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
4aaccf6b-876d-4306-ad08-bff40d67a92d	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	License Number	license_number	text	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
642851dc-22ba-4e60-9c25-7c68437d2234	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Province	province_id	select	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
20485c77-9743-4b2d-ade5-6568b79a50e7	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Kabupaten/Kota	kabupaten_id	select	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
57fa49e1-7d43-441d-b848-7c34adfb7034	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Status	status	select	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
b9f52710-3f84-4831-8c86-e2b90af146ec	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	License Date	license_date	date	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
008fadd5-2074-4cb2-abe7-623811f6c15d	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Region	region	text	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
e1956dc6-05b3-41d9-bc97-a651b93f8d98	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Latitude	latitude	number	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
e2b3f743-09f0-4498-95b2-ae6448cf0a93	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Longitude	longitude	number	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
ce048447-68e2-43f3-9b60-1abad14b4d0c	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	File Document	file_url	file	f	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
01e0fb73-74d9-4802-b76e-46538534d13b	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Data Source	data_source	text	t	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
2f0949a3-8d72-4bc6-8f45-2313f018cb56	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Created By	created_by	text	t	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
89d14cc9-b688-4a8f-acec-f6e96366ffcd	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Created At	created_at	date	t	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
9eac1be4-9bee-4167-8037-a567760c10f1	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Updated At	updated_at	date	t	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
\.


--
-- TOC entry 4744 (class 0 OID 47236)
-- Dependencies: 313
-- Data for Name: indonesian_regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.indonesian_regions (id, region_id, name, type, parent_id, created_at) FROM stdin;
78c8ca6e-806d-4a95-942d-f1f8af15c1d7	11	Aceh	province	\N	2025-08-30 09:55:16.6994+00
612be6a3-8767-4052-a785-fb3cf5d92fb8	12	Sumatera Utara	province	\N	2025-08-30 09:55:16.6994+00
62aeb863-ca19-4a9e-9ced-776bd34c8c5e	13	Sumatera Barat	province	\N	2025-08-30 09:55:16.6994+00
4f59ec80-2e33-4604-b2e2-23e383755593	14	Riau	province	\N	2025-08-30 09:55:16.6994+00
b8a53ba5-fcab-4533-abd3-2ea1e3472b4b	15	Jambi	province	\N	2025-08-30 09:55:16.6994+00
372d0d70-c239-4630-a459-01e69ec3e63f	16	Sumatera Selatan	province	\N	2025-08-30 09:55:16.6994+00
7c2e7370-b965-4505-9c12-333852221170	17	Bengkulu	province	\N	2025-08-30 09:55:16.6994+00
4aa1aa64-e98e-4678-8e48-64a54e5a35b0	18	Lampung	province	\N	2025-08-30 09:55:16.6994+00
e4dd0894-a19e-453d-af04-738b138c7cad	19	Kepulauan Bangka Belitung	province	\N	2025-08-30 09:55:16.6994+00
94ada203-9531-42d8-8241-b5ec7ebf6455	21	Kepulauan Riau	province	\N	2025-08-30 09:55:16.6994+00
64231c13-e499-43e8-83ef-c81a7bf35b80	31	DKI Jakarta	province	\N	2025-08-30 09:55:16.6994+00
698a1a9a-e367-4696-b13e-4d8e30715b6d	32	Jawa Barat	province	\N	2025-08-30 09:55:16.6994+00
8234df06-a8ba-46ce-a1c5-4d22c366acdd	33	Jawa Tengah	province	\N	2025-08-30 09:55:16.6994+00
a528a886-8fa6-451e-83fa-29d77a36348a	34	DI Yogyakarta	province	\N	2025-08-30 09:55:16.6994+00
a6d06de2-2cae-446d-93b4-2248f82de57e	35	Jawa Timur	province	\N	2025-08-30 09:55:16.6994+00
75057edc-ce08-4c1d-8048-b3ed671aa41f	36	Banten	province	\N	2025-08-30 09:55:16.6994+00
baec9042-9899-417a-aee1-b14664e3088b	51	Bali	province	\N	2025-08-30 09:55:16.6994+00
4b21e602-23c7-410b-a1fb-fee096fba1cd	52	Nusa Tenggara Barat	province	\N	2025-08-30 09:55:16.6994+00
9a7afbfb-434c-4d81-89c1-83b1357b8c14	53	Nusa Tenggara Timur	province	\N	2025-08-30 09:55:16.6994+00
eeac225b-37e3-4725-895a-2079a5bd5409	61	Kalimantan Barat	province	\N	2025-08-30 09:55:16.6994+00
2743af76-2abc-414c-a360-ae8096d10a16	62	Kalimantan Tengah	province	\N	2025-08-30 09:55:16.6994+00
cb24dff7-031e-40cd-a208-1f92595842de	63	Kalimantan Selatan	province	\N	2025-08-30 09:55:16.6994+00
7ba90452-1e6a-4a27-b903-77c9c957b9f6	64	Kalimantan Timur	province	\N	2025-08-30 09:55:16.6994+00
0cfa1d97-98f9-4e11-9ed0-c61ace63624f	65	Kalimantan Utara	province	\N	2025-08-30 09:55:16.6994+00
60126b61-8445-4676-a64b-f4184bc17a1c	71	Sulawesi Utara	province	\N	2025-08-30 09:55:16.6994+00
4f30cb72-a426-4d3b-951b-a428dcb55d48	72	Sulawesi Tengah	province	\N	2025-08-30 09:55:16.6994+00
c5cf7d7b-e861-43e2-97da-3a0c22e7e4bc	73	Sulawesi Selatan	province	\N	2025-08-30 09:55:16.6994+00
bd39b1f0-cb13-40ba-aca6-643bdb255d1d	74	Sulawesi Tenggara	province	\N	2025-08-30 09:55:16.6994+00
4d197f45-58cd-43b9-b684-bba26cd68c2c	75	Gorontalo	province	\N	2025-08-30 09:55:16.6994+00
b90dfad0-9e86-41d7-ad8b-8072313c924c	76	Sulawesi Barat	province	\N	2025-08-30 09:55:16.6994+00
1794902f-9a55-42d7-8cd8-62555deae78e	81	Maluku	province	\N	2025-08-30 09:55:16.6994+00
d2f87315-5a9b-48be-ad7b-e8ad2d80d99b	82	Maluku Utara	province	\N	2025-08-30 09:55:16.6994+00
cbd0b857-511f-4764-bedf-f4f4ff0052d5	91	Papua Barat	province	\N	2025-08-30 09:55:16.6994+00
e359c1ab-6bb4-40cb-a3c0-6b2efdac778a	94	Papua	province	\N	2025-08-30 09:55:16.6994+00
6f6f0bb5-2797-40f6-bd92-1ed7a72f8692	3171	Jakarta Selatan	regency	31	2025-08-30 09:55:16.6994+00
8aa44c5b-0d85-4865-9589-d03a202c1713	3172	Jakarta Timur	regency	31	2025-08-30 09:55:16.6994+00
57675c01-03c1-4584-84c1-03b0358dc439	3173	Jakarta Pusat	regency	31	2025-08-30 09:55:16.6994+00
bf763eda-a2c9-465e-8402-9247648dd92c	3174	Jakarta Barat	regency	31	2025-08-30 09:55:16.6994+00
9b0207e5-2d7f-4f81-af9e-5ca9d5a53eb2	3175	Jakarta Utara	regency	31	2025-08-30 09:55:16.6994+00
f057d7c5-8db7-4ff3-9a0a-24330252dd40	3176	Kepulauan Seribu	regency	31	2025-08-30 09:55:16.6994+00
61d4fdc6-0cd9-4664-99fe-c799833fd9fc	3201	Kabupaten Bogor	regency	32	2025-08-30 09:55:16.6994+00
6923c5da-10f5-494a-8b98-764603e6ee6a	3271	Kota Bogor	regency	32	2025-08-30 09:55:16.6994+00
83284b00-713c-4cbd-a7e6-ea8142e5fdfc	3273	Kota Bandung	regency	32	2025-08-30 09:55:16.6994+00
c7b33de2-4d93-4433-a07c-9917c32a1609	3274	Kota Bekasi	regency	32	2025-08-30 09:55:16.6994+00
c87a569a-11e3-45d1-849f-48f447de868d	3275	Kota Depok	regency	32	2025-08-30 09:55:16.6994+00
0ac7c922-5452-497d-83ce-3882f712cb29	317101	Jagakarsa	district	3171	2025-08-30 09:55:16.6994+00
251646f2-98af-4bef-9b15-358bcfaebb5a	317102	Pasar Minggu	district	3171	2025-08-30 09:55:16.6994+00
9df8be07-934b-4d27-b62a-5104abb5c28c	317103	Cilandak	district	3171	2025-08-30 09:55:16.6994+00
0f3317da-9995-4c93-9b3f-3b84d4d63d14	317104	Pesanggrahan	district	3171	2025-08-30 09:55:16.6994+00
76b0651f-2a02-4105-b8de-fadc4548b44b	317105	Kebayoran Lama	district	3171	2025-08-30 09:55:16.6994+00
808e6206-817c-4b02-9aac-dc08fb60c651	317106	Kebayoran Baru	district	3171	2025-08-30 09:55:16.6994+00
0353191f-f01e-4a24-b6bf-acb0e5184c28	317107	Mampang Prapatan	district	3171	2025-08-30 09:55:16.6994+00
fbed278f-bfea-48ef-840b-7160c6cf4b5c	317108	Pancoran	district	3171	2025-08-30 09:55:16.6994+00
22704c4a-0833-4374-b77f-70fc4232a9b2	317109	Tebet	district	3171	2025-08-30 09:55:16.6994+00
3cf7cc7e-1682-40c7-8b12-176384f41bb2	317110	Setiabudi	district	3171	2025-08-30 09:55:16.6994+00
593e13d9-a6f5-4dc9-9e3d-8873031c4dba	31710601	Petogogan	village	317106	2025-08-30 09:55:16.6994+00
942eecd8-b47e-4dfb-b22d-7ab41bfeb703	31710602	Gandaria Utara	village	317106	2025-08-30 09:55:16.6994+00
478d8b90-aef5-407e-8df9-52f9f12c1a96	31710603	Kramat Pela	village	317106	2025-08-30 09:55:16.6994+00
39533bef-5780-4406-91aa-c8e80f920608	31710604	Gunung	village	317106	2025-08-30 09:55:16.6994+00
cbda7e34-7834-4ca3-b814-b2c06396059d	31710605	Pulo	village	317106	2025-08-30 09:55:16.6994+00
dc1ed4f4-53ef-48ef-a6c1-7b5241acd7bd	31710606	Senayan	village	317106	2025-08-30 09:55:16.6994+00
99e2d391-be96-4635-b809-25d32a10e72f	31710607	Melawai	village	317106	2025-08-30 09:55:16.6994+00
6d5daa04-70b3-499b-8c31-15b9a0147fff	31710608	Cipete Utara	village	317106	2025-08-30 09:55:16.6994+00
ebfa9463-6086-4303-9b7e-4994858df735	31710609	Rawa Barat	village	317106	2025-08-30 09:55:16.6994+00
3817978a-f2fb-4a72-9488-b3c1f38ef0eb	3173.01	Gambir	kecamatan	3173	2025-09-09 18:31:08.983899+00
e17bced3-2647-4580-b2d7-3f5de2ff6b4c	3173.02	Sawah Besar	kecamatan	3173	2025-09-09 18:31:08.983899+00
6abec09b-3789-4eb4-a340-906a5e3ee6d4	3173.03	Kemayoran	kecamatan	3173	2025-09-09 18:31:08.983899+00
4ea36e22-1101-4a52-ba7e-c91d9545054e	3173.04	Senen	kecamatan	3173	2025-09-09 18:31:08.983899+00
9536e204-db70-48f5-a51f-e7ca8345a44d	3173.05	Cempaka Putih	kecamatan	3173	2025-09-09 18:31:08.983899+00
f44bd2df-72c8-4201-a94f-ad8f7bb73ded	3173.06	Menteng	kecamatan	3173	2025-09-09 18:31:08.983899+00
4f9267cc-6d36-417f-bfcd-10e462b18358	3173.07	Tanah Abang	kecamatan	3173	2025-09-09 18:31:08.983899+00
c5ca46f8-fd55-4fe8-9ade-f93d9ef814d5	3173.08	Johar Baru	kecamatan	3173	2025-09-09 18:31:08.983899+00
ab80dcce-416f-4379-abdf-30df7927dff7	3171.01	Jagakarsa	kecamatan	3171	2025-09-09 18:31:08.983899+00
246e3615-c961-4377-8193-b1743322b6fb	3171.02	Pasar Minggu	kecamatan	3171	2025-09-09 18:31:08.983899+00
6261e788-7d37-41ae-9c2e-360a9e347500	3171.03	Cilandak	kecamatan	3171	2025-09-09 18:31:08.983899+00
25ee571c-5364-422c-b420-9ab505b27f7e	3171.04	Pesanggrahan	kecamatan	3171	2025-09-09 18:31:08.983899+00
45dace83-37a7-4b7a-b922-ef9e64102cd3	3171.05	Kebayoran Lama	kecamatan	3171	2025-09-09 18:31:08.983899+00
e7efec0b-ea77-44f9-8867-89c49e0bc36e	3171.06	Kebayoran Baru	kecamatan	3171	2025-09-09 18:31:08.983899+00
58566148-9656-4b59-83ce-c8fa5b485b80	3171.07	Mampang Prapatan	kecamatan	3171	2025-09-09 18:31:08.983899+00
2a3fc8bc-d4fe-4276-899f-d4267c59440e	3171.08	Pancoran	kecamatan	3171	2025-09-09 18:31:08.983899+00
8a31a25d-39c3-485f-85a2-f78de2e5337b	3171.09	Tebet	kecamatan	3171	2025-09-09 18:31:08.983899+00
745f646f-7d9e-4cb8-b3fc-f4f038e8a388	3171.10	Setia Budi	kecamatan	3171	2025-09-09 18:31:08.983899+00
9e9851db-4583-488b-87f0-737af0fd25b7	3173.01.1	Gambir	kelurahan	3173.01	2025-09-09 18:31:08.983899+00
c6ad35ff-e58f-4376-87b7-992837333aab	3173.01.2	Cideng	kelurahan	3173.01	2025-09-09 18:31:08.983899+00
3ed24bf6-aa34-4014-a60f-d66de994d41f	3173.01.3	Petojo Selatan	kelurahan	3173.01	2025-09-09 18:31:08.983899+00
16afc199-8a75-4b16-b951-b853faefdfee	3173.01.4	Duri Pulo	kelurahan	3173.01	2025-09-09 18:31:08.983899+00
bb251c12-d27d-4711-aa44-085198662d13	3173.01.5	Kebon Kelapa	kelurahan	3173.01	2025-09-09 18:31:08.983899+00
701beb4f-18f3-48cf-b4d3-32c0a0d0495c	3173.01.6	Petojo Utara	kelurahan	3173.01	2025-09-09 18:31:08.983899+00
ec3e2259-5a9a-4219-a606-217e4cabcba5	3173.06.1	Menteng	kelurahan	3173.06	2025-09-09 18:31:08.983899+00
1ad21a77-d658-40f0-87f1-4a26532b3145	3173.06.2	Pegangsaan	kelurahan	3173.06	2025-09-09 18:31:08.983899+00
a70614f0-e1bc-4ccb-930c-58784a888167	3173.06.3	Cikini	kelurahan	3173.06	2025-09-09 18:31:08.983899+00
369038d3-82e8-43de-ac3c-f3ec72c76f9e	3173.06.4	Gondangdia	kelurahan	3173.06	2025-09-09 18:31:08.983899+00
8dc50ed1-092e-4bb4-a4db-0d54ed18347a	3173.06.5	Kebon Sirih	kelurahan	3173.06	2025-09-09 18:31:08.983899+00
6c7b8fe3-92cc-4104-8354-9c15b075bc95	3171.06.1	Senayan	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
64bb15c7-dcaf-4d4e-8b92-bdeb3480b7ff	3171.06.2	Melawai	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
fc093406-815b-41b1-aae6-122628c37ba5	3171.06.3	Petogogan	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
9c98d5f5-92a5-46de-a4f5-64d7e5ec2236	3171.06.4	Gandaria Utara	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
ff03a56c-12e8-413b-a5cb-402abd73041a	3171.06.5	Kramat Pela	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
f85077f9-f1b7-4c1b-8213-64304d20e844	3171.06.6	Gunung	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
16716c38-5e2e-4fca-ba8c-7115d973fded	3171.06.7	Rawa Barat	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
46cd8afc-9d4b-47f2-83af-ec33cd92da04	3171.06.8	Cipete Utara	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
b137513b-100d-4b96-b13a-feb59a3113a2	3171.06.9	Pulo	kelurahan	3171.06	2025-09-09 18:31:08.983899+00
\.


--
-- TOC entry 4725 (class 0 OID 18875)
-- Dependencies: 294
-- Data for Name: kabupaten; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kabupaten (id, province_id, code, name, type, latitude, longitude, created_at, updated_at) FROM stdin;
50648878-a4cb-4aac-9dc1-fce3ea1bdad5	b7777678-3862-460c-b2d2-76aa1ce3f640	3171	Jakarta Selatan	kota	-6.2614927	106.8105998	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
384bdce6-252d-4c7c-8b14-a5259283a185	b7777678-3862-460c-b2d2-76aa1ce3f640	3172	Jakarta Timur	kota	-6.2249396	106.9004281	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
a86d1c4d-a6bb-40c0-884a-0ca252fca655	b7777678-3862-460c-b2d2-76aa1ce3f640	3173	Jakarta Pusat	kota	-6.1805149	106.8283583	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
91556806-5e37-4f0c-8b58-5059cebf91fb	b7777678-3862-460c-b2d2-76aa1ce3f640	3174	Jakarta Barat	kota	-6.1352	106.813301	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
8ff8a206-0f64-451e-ae00-9542cc52aee2	b7777678-3862-460c-b2d2-76aa1ce3f640	3175	Jakarta Utara	kota	-6.138414	106.863956	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
d9c37077-a284-44df-8c15-cf4c8df1f471	11088c86-0540-4d5e-bd83-60392db02d77	3273	Bandung	kota	-6.9174639	107.6191228	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
9b7e4404-6618-4218-adaa-edff8dbf6bf4	11088c86-0540-4d5e-bd83-60392db02d77	3204	Bandung	kabupaten	-7.0051453	107.5587606	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
028f9013-dcf7-4875-b755-f4d732c0d904	11088c86-0540-4d5e-bd83-60392db02d77	3276	Depok	kota	-6.4025124	106.7942276	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
e7e65729-d233-4067-b1ec-b71247951c46	11088c86-0540-4d5e-bd83-60392db02d77	3201	Bogor	kabupaten	-6.595038	106.816635	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
16957ab7-1fcd-43ce-99ea-84d9b6fb8573	11088c86-0540-4d5e-bd83-60392db02d77	3271	Bogor	kota	-6.5971469	106.8060388	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
a9e43abd-0c4e-4e2b-9f11-99cc49e5a0fc	5ae1fcd8-bcc1-407e-b65b-963088857753	3374	Semarang	kota	-6.9932571	110.4203043	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
e5bf747a-86a1-4952-b499-51368b86bc08	5ae1fcd8-bcc1-407e-b65b-963088857753	3326	Semarang	kabupaten	-7.1462	110.4985	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
4a221493-854f-43a5-bf12-894cc6c65c0e	5ae1fcd8-bcc1-407e-b65b-963088857753	3372	Surakarta	kota	-7.5755049	110.8243272	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
920a6787-9a03-4dd4-84d9-e60ec600a067	af7d45cb-f359-4106-a323-79b6f8368aa7	3578	Surabaya	kota	-7.2459717	112.7378266	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
17d832f8-d94d-4a10-88c9-fb2b490cb972	af7d45cb-f359-4106-a323-79b6f8368aa7	3573	Malang	kota	-7.9666204	112.6326321	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
c464bca7-43d1-4f27-b94b-4a699ba7bfad	af7d45cb-f359-4106-a323-79b6f8368aa7	3563	Malang	kabupaten	-8.1844791	112.6304102	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
b1727293-bd03-4099-9b06-d33131221685	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1271	Medan	kota	3.5951956	98.6722227	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
00c1971a-397f-4d73-b3c2-9c3491da3c5c	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1275	Binjai	kota	3.6001	98.4854	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
94e34676-ff9b-484d-abec-fc18ec9cfcc6	f12930f9-00d2-4b98-84ef-5ddb9cd7dcb2	1371	Padang	kota	-0.9471389	100.4172436	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
51cbfad9-4892-45ca-b18d-b4d85d3855f7	391111d7-c48e-468e-a052-18b1b14cae83	1471	Pekanbaru	kota	0.5070718	101.4477932	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
04e54283-5f67-4b52-a069-ff798feed441	2baa91fa-924e-413c-bc59-b01cb28d2f2b	1671	Palembang	kota	-2.9760735	104.7754307	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
42bd8c16-00c1-4678-98f6-d6073d59a279	55280f33-5337-4654-81d0-7879c4433b50	1871	Bandar Lampung	kota	-5.3971038	105.2668038	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
3357e945-e7f2-40bf-a67d-0ee52cd28684	62a8a7e6-3631-4e71-bab9-b5e486881558	5171	Denpasar	kota	-8.6704582	115.2126293	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
51c9f523-f796-4954-98b4-5b37b9af668f	9fe9c976-554a-4b16-a653-bf6d1ff9e6a1	7371	Makassar	kota	-5.1476651	119.4327314	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
cf84c6fc-f2ae-4dec-bb67-7a9c499afee5	aedafeb2-28b2-4955-9cb6-530fa9a67161	6472	Balikpapan	kota	-1.2379274	116.8316051	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
ee010fff-6247-42ba-ae48-73894c15c872	aedafeb2-28b2-4955-9cb6-530fa9a67161	6471	Samarinda	kota	-0.4985343	117.1436676	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
44d59d1f-51df-4544-a220-a1059d6891a8	1cd635cd-6dc7-40e3-bec5-f3b038227933	1101	Simeulue	kabupaten	2.6111	96.0906	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
060290a2-9bf8-43e0-8c9d-018267bba30c	1cd635cd-6dc7-40e3-bec5-f3b038227933	1102	Aceh Singkil	kabupaten	2.4200	97.9300	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
e365fdfb-cf25-46c9-b832-4d9a72755a7e	1cd635cd-6dc7-40e3-bec5-f3b038227933	1103	Aceh Selatan	kabupaten	3.2333	97.4167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
0a911219-1170-423d-89d3-927030839f32	1cd635cd-6dc7-40e3-bec5-f3b038227933	1104	Aceh Tenggara	kabupaten	3.3258	97.7217	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
9762bd2d-49f8-4f32-87cb-14678decde4f	1cd635cd-6dc7-40e3-bec5-f3b038227933	1105	Aceh Timur	kabupaten	4.6333	97.6333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5db3c228-def7-4155-a1f0-3e3612c5521e	1cd635cd-6dc7-40e3-bec5-f3b038227933	1106	Aceh Tengah	kabupaten	4.6272	96.8322	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
637de854-0518-4f86-8adc-8180d0c981ac	1cd635cd-6dc7-40e3-bec5-f3b038227933	1107	Aceh Barat	kabupaten	4.4500	96.1667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
b074e771-ec0f-4fea-9863-441807eec8d4	1cd635cd-6dc7-40e3-bec5-f3b038227933	1108	Aceh Besar	kabupaten	5.5000	95.4500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
bb5d6657-e76e-4d24-8231-a201c8d6c1cf	1cd635cd-6dc7-40e3-bec5-f3b038227933	1109	Pidie	kabupaten	5.1333	96.1500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
bee31984-4606-4958-ad81-1cd89454e5d2	1cd635cd-6dc7-40e3-bec5-f3b038227933	1110	Bireuen	kabupaten	5.2000	96.7000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
31e06c88-3138-4b51-80e9-127f1550e916	1cd635cd-6dc7-40e3-bec5-f3b038227933	1111	Aceh Utara	kabupaten	5.1750	97.1333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
7c931388-2dc9-4c16-8cd1-5c34fc481d7f	1cd635cd-6dc7-40e3-bec5-f3b038227933	1112	Aceh Barat Daya	kabupaten	3.7833	96.8667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5d64babf-4a16-49c3-82c3-aadbde7fd8b3	1cd635cd-6dc7-40e3-bec5-f3b038227933	1113	Gayo Lues	kabupaten	4.1833	97.3167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
27f34202-16e8-4054-a198-66db48e0363c	1cd635cd-6dc7-40e3-bec5-f3b038227933	1114	Aceh Tamiang	kabupaten	4.2500	98.0167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
7a25ffff-2833-4363-81bd-f1e85d1fd96c	1cd635cd-6dc7-40e3-bec5-f3b038227933	1115	Nagan Raya	kabupaten	4.1333	96.5500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ba2e0a89-6e44-48aa-a969-c7b314320612	1cd635cd-6dc7-40e3-bec5-f3b038227933	1116	Aceh Jaya	kabupaten	4.7667	95.6833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
a77cc87e-e0b0-4115-886f-c77adb3ee60e	1cd635cd-6dc7-40e3-bec5-f3b038227933	1117	Bener Meriah	kabupaten	4.7833	96.8333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
c7129e2d-6125-48ea-aeb7-94f2d4ede03c	1cd635cd-6dc7-40e3-bec5-f3b038227933	1118	Pidie Jaya	kabupaten	5.1000	96.1833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
28114c65-df06-4594-bc56-c05093724810	1cd635cd-6dc7-40e3-bec5-f3b038227933	1171	Banda Aceh	kota	5.5577	95.3222	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
bcadb217-4e0a-497d-ae0e-bb19c2e74bed	1cd635cd-6dc7-40e3-bec5-f3b038227933	1172	Sabang	kota	5.8944	95.3194	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5de2e3c6-7d95-49c8-96f6-9cedb4fa553b	1cd635cd-6dc7-40e3-bec5-f3b038227933	1173	Langsa	kota	4.4683	97.9683	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
c99befe7-c359-44f9-87c3-e6d9da903eb0	1cd635cd-6dc7-40e3-bec5-f3b038227933	1174	Lhokseumawe	kota	5.1794	97.1508	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
d9a41550-1b34-4573-8f00-9e1e5393a2c5	1cd635cd-6dc7-40e3-bec5-f3b038227933	1175	Subulussalam	kota	2.6833	97.9333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
834d578f-5db9-491f-918c-b99cb38131b1	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1201	Nias	kabupaten	1.0833	97.5833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
be38e7bd-9c53-4c2a-a0d9-0b9774ddc3f3	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1202	Mandailing Natal	kabupaten	0.7833	99.3500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
71eca4d7-70e0-4214-b012-a30fc867f679	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1203	Tapanuli Selatan	kabupaten	1.5500	99.2667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
3477b187-461b-4085-b7b6-37da648896b5	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1204	Tapanuli Tengah	kabupaten	1.9167	98.6833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
8c375742-df72-46fc-82a6-15b56b211a29	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1205	Tapanuli Utara	kabupaten	2.0167	99.0667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
48358159-5a82-4194-b55d-2e0403b8f712	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1206	Toba Samosir	kabupaten	2.6500	99.0833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
9dd42c1c-71fc-482d-9b5c-ffe11e11142e	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1207	Labuhan Batu	kabupaten	2.2000	100.1167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
6288bf40-5bb9-4ab9-a879-d33cda2475ea	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1208	Asahan	kabupaten	2.9833	99.6167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
961be90e-573f-4d7a-89cb-0dadf649ee70	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1209	Simalungun	kabupaten	3.0000	99.0000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
dbd08f90-f512-4ca2-94d7-1d35b90c3457	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1210	Dairi	kabupaten	2.8500	98.2167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
021256bd-bed4-47c9-8cf3-fa0effad269b	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1211	Karo	kabupaten	3.1333	98.5000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ec8bc60a-86c5-4e0f-99ff-2bb914b65d4e	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1212	Deli Serdang	kabupaten	3.4333	98.6833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ef5b6977-b41c-4b2a-93d9-66bdd2b61185	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1213	Langkat	kabupaten	3.7833	98.0833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
d8a08da9-4179-449c-9ba6-4be6b315fbde	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1214	Nias Selatan	kabupaten	0.8000	97.7500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
40d11b61-0507-4147-a1e9-6dfd9a3f14d8	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1215	Humbang Hasundutan	kabupaten	2.2833	98.5000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ee39016e-9994-4298-9987-e31de5cebcad	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1216	Pakpak Bharat	kabupaten	2.6167	98.2667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5ba64387-db8a-465c-b418-c1c26a101422	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1217	Samosir	kabupaten	2.5833	98.7167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
81287d7b-0a5c-481d-9427-fbc40dd43923	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1218	Serdang Bedagai	kabupaten	3.3667	99.1167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
395ecd6d-8a9b-4034-acf9-31b936679bd7	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1219	Batu Bara	kabupaten	3.8167	99.4833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
b2f29bf3-b7a8-42a9-a5e9-2606acfd9558	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1220	Padang Lawas Utara	kabupaten	1.7000	99.8167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
de71dd54-65fb-4580-abb4-a50eac6b4f7c	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1221	Padang Lawas	kabupaten	1.3833	99.8167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
a7258141-82e2-4ca6-b0db-e81cda4d4a1b	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1222	Labuhan Batu Selatan	kabupaten	1.8500	100.1833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
0556d8fa-eee1-48bb-ba6d-fe06be2664db	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1223	Labuhan Batu Utara	kabupaten	2.3500	100.0167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5af50d0e-6ae5-4e27-98d3-34804937c431	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1224	Nias Utara	kabupaten	1.4167	97.5167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
f417ad18-8bc6-4c2b-8eaf-b3e85a96f446	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1225	Nias Barat	kabupaten	1.1333	97.3667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
4bd856ae-733e-4acd-a5fd-89d38f4b7f25	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1272	Tanjung Balai	kota	2.9667	99.7944	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ad6a5bbe-5ddd-4c5b-858b-38ef2a2d2189	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1273	Pematang Siantar	kota	2.9500	99.0500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
2686ad12-6754-4209-a9b9-72e9a1e7ebb2	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1274	Tebing Tinggi	kota	3.3167	99.1667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
76a9d626-e5b6-4118-8c7c-f7beecb4be08	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1276	Binjai	kota	3.6000	98.4833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
77483589-86b7-4562-90d9-ba82181395c7	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1277	Padangsidimpuan	kota	1.3667	99.2667	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
cacfd04d-3796-4fd2-9cea-b3216666f55f	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	1278	Gunungsitoli	kota	1.2833	97.6167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
3d396e42-0579-4a82-90c9-2400cf8bb3de	b7777678-3862-460c-b2d2-76aa1ce3f640	3101	Kepulauan Seribu	kabupaten	-5.6167	106.5167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
a58ee119-48b7-4efa-93d0-30692df79585	11088c86-0540-4d5e-bd83-60392db02d77	3202	Sukabumi	kabupaten	-6.9175	106.9269	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
305c702d-8db4-47e7-a5f4-4e0b32f82d78	11088c86-0540-4d5e-bd83-60392db02d77	3203	Cianjur	kabupaten	-6.8200	107.1428	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
54f6dc70-0d23-4da7-bc6f-9a103b6764d0	11088c86-0540-4d5e-bd83-60392db02d77	3205	Garut	kabupaten	-7.2134	107.9065	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
6ded5db8-d677-4802-b643-09e4b104e986	11088c86-0540-4d5e-bd83-60392db02d77	3206	Tasikmalaya	kabupaten	-7.3274	108.2207	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
c063e4d1-82a2-4562-a5f7-d0501d02649e	11088c86-0540-4d5e-bd83-60392db02d77	3207	Ciamis	kabupaten	-7.3257	108.3534	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
eff39342-337f-4c0e-ae27-2cabe248af6c	11088c86-0540-4d5e-bd83-60392db02d77	3208	Kuningan	kabupaten	-6.9759	108.4837	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
debbd72b-2c93-471f-b38d-7d186e2a3bee	11088c86-0540-4d5e-bd83-60392db02d77	3209	Cirebon	kabupaten	-6.7063	108.5573	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
d5c27470-c69b-4471-8236-95ccb08dd66c	11088c86-0540-4d5e-bd83-60392db02d77	3210	Majalengka	kabupaten	-6.8361	108.2273	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
992ef74e-51d0-4da9-9ef7-49bc49167860	11088c86-0540-4d5e-bd83-60392db02d77	3211	Sumedang	kabupaten	-6.8595	107.9239	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
1101f570-6549-4f33-a816-33d928f53fde	11088c86-0540-4d5e-bd83-60392db02d77	3212	Indramayu	kabupaten	-6.3264	108.3200	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
f4ef62bc-0f3c-4b8b-a50c-e7a9e792d756	11088c86-0540-4d5e-bd83-60392db02d77	3213	Subang	kabupaten	-6.5693	107.7607	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
eb2e84b0-98c9-40d3-83b5-f735a13d31a0	11088c86-0540-4d5e-bd83-60392db02d77	3214	Purwakarta	kabupaten	-6.5569	107.4431	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
9ae64172-64b7-43c7-bc44-7afb8a29410b	11088c86-0540-4d5e-bd83-60392db02d77	3215	Karawang	kabupaten	-6.3064	107.3373	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
70899938-4119-45e8-a468-175a8a74d5ea	11088c86-0540-4d5e-bd83-60392db02d77	3216	Bekasi	kabupaten	-6.2383	107.1564	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
266ca0d7-0507-4bcf-8b25-829744d62464	11088c86-0540-4d5e-bd83-60392db02d77	3217	Bandung Barat	kabupaten	-6.8612	107.4675	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
dd915052-0eae-45b2-a6ad-a1a70572d409	11088c86-0540-4d5e-bd83-60392db02d77	3218	Pangandaran	kabupaten	-7.6851	108.6500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
255b5f8d-0ec1-425d-b490-b7f745165db5	11088c86-0540-4d5e-bd83-60392db02d77	3272	Sukabumi	kota	-6.9278	106.9361	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ae248c07-8a6a-456d-b6c2-b0d6beed7543	11088c86-0540-4d5e-bd83-60392db02d77	3274	Cirebon	kota	-6.7320	108.5570	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
b2d2c5e9-91ee-4ec0-9b41-74b37521f297	11088c86-0540-4d5e-bd83-60392db02d77	3275	Bekasi	kota	-6.2441	106.9918	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
36b011c5-dae4-48ff-ade2-ea0236ebb646	11088c86-0540-4d5e-bd83-60392db02d77	3277	Cimahi	kota	-6.8721	107.5420	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
a38be591-9bc9-46b9-867b-7926ec7feb03	11088c86-0540-4d5e-bd83-60392db02d77	3278	Tasikmalaya	kota	-7.3506	108.2175	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ff0aa796-c59a-43ee-8510-a20eca1eb8f3	11088c86-0540-4d5e-bd83-60392db02d77	3279	Banjar	kota	-7.3700	108.5389	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
444493c7-501f-48a0-b804-c6839bc485e5	62a8a7e6-3631-4e71-bab9-b5e486881558	5101	Jembrana	kabupaten	-8.2167	114.6167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
2571da15-58f4-4b40-a09f-30edaa7fab04	62a8a7e6-3631-4e71-bab9-b5e486881558	5102	Tabanan	kabupaten	-8.5389	115.1194	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5894d7b3-80de-42a2-aef3-1f9df9b8f122	62a8a7e6-3631-4e71-bab9-b5e486881558	5103	Badung	kabupaten	-8.5506	115.1761	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ed575ae8-9553-4868-b005-583916a77224	62a8a7e6-3631-4e71-bab9-b5e486881558	5104	Gianyar	kabupaten	-8.5400	115.3289	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
2201a62b-efe2-4c27-999b-baccbd63d631	62a8a7e6-3631-4e71-bab9-b5e486881558	5105	Klungkung	kabupaten	-8.5167	115.4167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
c5c6bbf9-cc58-45e8-9377-ce5fa11ff8df	62a8a7e6-3631-4e71-bab9-b5e486881558	5106	Bangli	kabupaten	-8.2833	115.3500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
46432bb3-e4c6-468b-afa9-7282c3e692e8	62a8a7e6-3631-4e71-bab9-b5e486881558	5107	Karangasem	kabupaten	-8.4500	115.6167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
3796f263-c263-4f84-954d-86eb39334abe	62a8a7e6-3631-4e71-bab9-b5e486881558	5108	Buleleng	kabupaten	-8.1167	115.0833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
98535843-a942-44cf-995e-dfe6bfd69bcb	9073f107-0dbe-42e6-af72-c85f444e154b	9401	Merauke	kabupaten	-8.4667	140.4000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
ea9804e7-20e7-4980-9d72-d91f2a6e12ac	9073f107-0dbe-42e6-af72-c85f444e154b	9402	Jayawijaya	kabupaten	-4.0833	138.9167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
252e4beb-1f62-431c-ad47-a039f06441f5	9073f107-0dbe-42e6-af72-c85f444e154b	9403	Jayapura	kabupaten	-2.5333	140.7167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
163623f0-2ee5-4990-bfa0-be6a9494c85d	9073f107-0dbe-42e6-af72-c85f444e154b	9404	Nabire	kabupaten	-3.3667	135.4833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
79c102d6-6ea4-4775-8a0f-f5bfbf384bd9	9073f107-0dbe-42e6-af72-c85f444e154b	9405	Kepulauan Yapen	kabupaten	-1.7500	136.0833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
a4dcbaf7-4d0b-4ea1-ac36-e89581847c73	9073f107-0dbe-42e6-af72-c85f444e154b	9406	Biak Numfor	kabupaten	-1.1833	136.0833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
fff6d938-8b7c-4682-bf33-cc8c2f8b855d	9073f107-0dbe-42e6-af72-c85f444e154b	9407	Paniai	kabupaten	-3.9167	136.3500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
771e51ec-c61c-4dc5-bf30-78dc413edd6b	9073f107-0dbe-42e6-af72-c85f444e154b	9408	Puncak Jaya	kabupaten	-4.0833	137.1500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
929c464b-ec65-4de9-8c00-099194fa8729	9073f107-0dbe-42e6-af72-c85f444e154b	9409	Mimika	kabupaten	-4.5333	136.5500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
22b2eadd-f926-4d8f-aab6-f611e0df2ee0	9073f107-0dbe-42e6-af72-c85f444e154b	9410	Boven Digoel	kabupaten	-6.2167	140.3833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
5e251f2c-a4c6-4703-adc9-17ec69988a7f	9073f107-0dbe-42e6-af72-c85f444e154b	9411	Mappi	kabupaten	-7.0000	139.4167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
c54a6a64-1c95-45bc-8061-a60d11326179	9073f107-0dbe-42e6-af72-c85f444e154b	9412	Asmat	kabupaten	-5.5000	138.4833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
38809c4e-f6c2-408b-8d64-4c05ef812867	9073f107-0dbe-42e6-af72-c85f444e154b	9413	Yahukimo	kabupaten	-4.6167	139.4167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
07784c78-a3eb-4beb-a3c7-15d19748d6bd	9073f107-0dbe-42e6-af72-c85f444e154b	9414	Pegunungan Bintang	kabupaten	-4.8000	140.3167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
f0b151e8-9564-458a-a4d6-3ef8bd708ae2	9073f107-0dbe-42e6-af72-c85f444e154b	9415	Tolikara	kabupaten	-3.5167	138.0500	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
7d4d6b91-f856-4870-b312-37a27f98b649	9073f107-0dbe-42e6-af72-c85f444e154b	9416	Sarmi	kabupaten	-2.3167	138.7833	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
c5baf680-c40d-4695-bb8c-fc9b5113300d	9073f107-0dbe-42e6-af72-c85f444e154b	9417	Keerom	kabupaten	-3.2833	140.6167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
2adaa4b7-1169-4304-bef1-43511ae7310f	9073f107-0dbe-42e6-af72-c85f444e154b	9418	Waropen	kabupaten	-2.0833	136.6333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
debeaa64-8346-43b1-b715-dc16f75b4a41	9073f107-0dbe-42e6-af72-c85f444e154b	9419	Supiori	kabupaten	-0.7667	135.5333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
b16ef355-2072-4bcd-837f-01d612b06753	9073f107-0dbe-42e6-af72-c85f444e154b	9420	Mamberamo Raya	kabupaten	-2.3333	138.2167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
8181a001-c554-4765-96b6-c90425984d9b	9073f107-0dbe-42e6-af72-c85f444e154b	9421	Nduga	kabupaten	-4.5000	138.2333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
701d86c8-ad46-4e92-b8d3-f3ddce09a82a	9073f107-0dbe-42e6-af72-c85f444e154b	9422	Lanny Jaya	kabupaten	-3.9167	138.3167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
dbcbc922-0fc4-4512-881a-b2fce2a9fa84	9073f107-0dbe-42e6-af72-c85f444e154b	9423	Mamberamo Tengah	kabupaten	-2.8333	138.4000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
7a3587ee-8da8-44f1-834d-cc657dc26366	9073f107-0dbe-42e6-af72-c85f444e154b	9424	Yalimo	kabupaten	-3.8333	138.7167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
d8d8e19f-4371-4b0e-9175-b41193af830c	9073f107-0dbe-42e6-af72-c85f444e154b	9425	Puncak	kabupaten	-3.3500	137.4167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
3882d1c8-5b32-4467-8015-d34e3da3871f	9073f107-0dbe-42e6-af72-c85f444e154b	9426	Dogiyai	kabupaten	-4.1000	135.7333	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
6468341a-7f18-4321-9a0f-b7029fd674d5	9073f107-0dbe-42e6-af72-c85f444e154b	9427	Intan Jaya	kabupaten	-3.4167	136.8167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
68ef6661-1449-403e-aee0-f779b3db30b4	9073f107-0dbe-42e6-af72-c85f444e154b	9428	Deiyai	kabupaten	-4.2000	136.2167	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
fe096c25-4df4-4a61-ab47-4692e451681b	9073f107-0dbe-42e6-af72-c85f444e154b	9471	Jayapura	kota	-2.5167	140.7000	2025-08-05 12:11:10.0214+00	2025-08-05 12:11:10.0214+00
\.


--
-- TOC entry 4736 (class 0 OID 45963)
-- Dependencies: 305
-- Data for Name: license_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_applications (id, application_number, company_id, applicant_id, license_service_id, status, submitted_at, approved_at, approved_by, assigned_evaluator, form_data, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4735 (class 0 OID 45952)
-- Dependencies: 304
-- Data for Name: license_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_services (id, name, license_type, description, requirements, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4742 (class 0 OID 46071)
-- Dependencies: 311
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_attempts (id, email, ip_address, attempted_at, success, user_agent) FROM stdin;
\.


--
-- TOC entry 4728 (class 0 OID 31221)
-- Dependencies: 297
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, name, code, description, parent_module_id, is_active, created_at, updated_at) FROM stdin;
54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	Dashboard	dashboard	Main dashboard and analytics	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	Data Management	data_management	Telecommunications data management	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
3edadc70-0c55-45da-b9eb-d268c7caff4e	Data Visualization	data_visualization	Data charts and visualization	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
09195e7e-c4f5-46ff-95d4-b5ada37541d8	FAQ Management	faq	FAQ content management	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
2332bd97-0486-4153-9bca-81d2d1483814	Support/Tickets	support	Support ticket system	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	User Management	user_management	User and role management	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
0906ce77-9308-41bd-a954-b41768c36bf4	Admin FAQ	admin_faq	Administrative FAQ management	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
a381aa9b-1045-4853-8db0-ddaee7d7a487	Admin Tickets	admin_tickets	Administrative ticket management	\N	t	2025-08-17 05:21:42.696281+00	2025-08-17 05:21:42.696281+00
\.


--
-- TOC entry 4732 (class 0 OID 31308)
-- Dependencies: 301
-- Data for Name: permission_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission_templates (id, name, description, target_role, permissions_config, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4730 (class 0 OID 31259)
-- Dependencies: 299
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, role, module_id, field_id, can_create, can_read, can_update, can_delete, field_access, conditions, created_by, created_at, updated_at) FROM stdin;
94c3ce43-9e81-4060-a771-2db670e676f4	internal_admin	54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
9f719c7d-0798-4b19-a16f-35a59269c734	internal_admin	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
e92680dc-67f8-4976-920b-b74b5c6e8e28	internal_admin	3edadc70-0c55-45da-b9eb-d268c7caff4e	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
8be04951-3518-4418-a124-e447010bcc95	internal_admin	09195e7e-c4f5-46ff-95d4-b5ada37541d8	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
d02c1bc1-0c54-4cc9-8ec1-a1dfbfc87511	internal_admin	2332bd97-0486-4153-9bca-81d2d1483814	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
c7327305-dc64-49c0-a535-449dfe5b5c48	internal_admin	7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
7b69e908-214d-4d82-945b-b54c0b77f344	internal_admin	0906ce77-9308-41bd-a954-b41768c36bf4	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
60b52fa1-5d9d-45ca-98ce-590b699b7c9e	internal_admin	a381aa9b-1045-4853-8db0-ddaee7d7a487	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
51bbd213-b991-45c9-b89f-fd69901b8c62	pelaku_usaha	54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
988bf529-9b2e-49e8-a312-3c3fcb70188f	pelaku_usaha	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	\N	t	t	t	f	read_only	{"own_records_only": true}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
dd4652f4-8ae6-4202-ad29-976f83d08204	pelaku_usaha	3edadc70-0c55-45da-b9eb-d268c7caff4e	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
dfab2d38-21a5-4b84-a36e-067dd6500af1	pelaku_usaha	09195e7e-c4f5-46ff-95d4-b5ada37541d8	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
d4169c8d-4abe-413e-89d4-3283881ae9ce	pelaku_usaha	2332bd97-0486-4153-9bca-81d2d1483814	\N	t	t	t	f	read_only	{"own_tickets_only": true}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
3a11d4ad-6121-44bb-a0cb-23d9505b756a	pelaku_usaha	7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
35a168a0-0504-4ddd-83bf-dedadc4476d5	pelaku_usaha	0906ce77-9308-41bd-a954-b41768c36bf4	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
ea8e5d78-5efb-42cd-a69d-832b05cd3a31	pelaku_usaha	a381aa9b-1045-4853-8db0-ddaee7d7a487	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
007a7bd7-f5cc-42fc-b246-4f141dc5daf2	internal_group	54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
2bf69449-205b-4e2a-8464-f581252d0a86	internal_group	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
0cd3c843-8534-4d53-be21-948d7e073821	internal_group	3edadc70-0c55-45da-b9eb-d268c7caff4e	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
96dafd78-3304-4f1c-b4f3-be87dd6c567f	internal_group	09195e7e-c4f5-46ff-95d4-b5ada37541d8	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
17ba2d86-10f2-4b98-bf0b-42f54484c628	internal_group	2332bd97-0486-4153-9bca-81d2d1483814	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
2865cb36-69a1-4780-aef3-f9af54e44ae0	internal_group	7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
98f10f8c-5aa9-49f6-b4bc-b3069aaa3947	internal_group	0906ce77-9308-41bd-a954-b41768c36bf4	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
e2beb11b-181f-49f4-91fc-59711298587c	internal_group	a381aa9b-1045-4853-8db0-ddaee7d7a487	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-08-17 05:23:09.693519+00
788aaa9c-28bf-4f43-ab01-29dec6af52d4	pengolah_data	0906ce77-9308-41bd-a954-b41768c36bf4	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
eeb3ad1a-76f7-421c-b129-b7b238df4259	pengolah_data	09195e7e-c4f5-46ff-95d4-b5ada37541d8	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
aa5dce8e-1db2-480b-ae30-410663d421eb	pengolah_data	2332bd97-0486-4153-9bca-81d2d1483814	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
17023ade-0ac9-4c05-b09d-340bc022ba04	pengolah_data	3edadc70-0c55-45da-b9eb-d268c7caff4e	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
657c513e-7728-44ab-abc1-a13f4acc2d16	pengolah_data	54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
73bd11ef-3926-48e5-b187-65f89bc384e2	pengolah_data	7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
1252f922-18e5-4cab-96af-eec5f24e8b88	pengolah_data	a381aa9b-1045-4853-8db0-ddaee7d7a487	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
e825ace0-9ab3-4d04-9dcd-d08401623c1c	pengolah_data	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:59:15.478935+00
016d8c37-fe72-44ad-bacb-4a819d1f8f91	super_admin	54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
d55c370e-2922-4e36-8a9c-61267806d702	super_admin	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
530e6470-c962-4e06-8004-e4b605876514	super_admin	3edadc70-0c55-45da-b9eb-d268c7caff4e	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
41c81b45-906c-47a2-9149-ed7bf105480f	super_admin	09195e7e-c4f5-46ff-95d4-b5ada37541d8	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
36f50fa2-7595-4504-a443-862b8fe1c2cb	super_admin	2332bd97-0486-4153-9bca-81d2d1483814	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
3c125f4c-29c1-4601-a33e-e696dba3d5ca	super_admin	7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
27eea48c-6c39-4f0b-8f48-a31b6dc2ada8	super_admin	0906ce77-9308-41bd-a954-b41768c36bf4	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
b52ff751-53c6-4b72-b5ec-7b38ff3905c7	super_admin	a381aa9b-1045-4853-8db0-ddaee7d7a487	\N	t	t	t	t	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:52:20.660385+00
b6303d91-4b98-4b1c-aefa-8d45420379f1	guest	54c47d2f-cfc0-4e17-9eeb-5fdd39c51404	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
22665973-bb3b-4256-b284-7121cc2438cb	guest	f3c18c6a-ebc9-4d92-a7a7-47af7081bfbc	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
2e7b9911-9d81-47ee-a365-d327134dc4fd	guest	3edadc70-0c55-45da-b9eb-d268c7caff4e	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
589d3d18-74a5-4849-8994-5ee8b171f4b7	guest	09195e7e-c4f5-46ff-95d4-b5ada37541d8	\N	f	t	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
c61feb2c-7a16-4e5c-bb16-ddfc2e738bfe	guest	2332bd97-0486-4153-9bca-81d2d1483814	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
94bdc08b-7105-45b7-ae49-e35bc4a92d4f	guest	7aa9a9ae-d1f3-4650-b8ea-0ee345f6c92f	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
a25841f9-ea1c-4243-a9da-a02b16972955	guest	0906ce77-9308-41bd-a954-b41768c36bf4	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
ec32e36f-5911-4422-8610-e4aae5f1b84a	guest	a381aa9b-1045-4853-8db0-ddaee7d7a487	\N	f	f	f	f	read_only	{}	\N	2025-08-17 05:23:09.693519+00	2025-09-06 19:50:48.889969+00
\.


--
-- TOC entry 4750 (class 0 OID 57409)
-- Dependencies: 319
-- Data for Name: person_in_charge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_in_charge (id, company_id, full_name, id_number, phone_number, "position", province_id, kabupaten_id, kecamatan, kelurahan, postal_code, address, created_at, updated_at) FROM stdin;
3f195e54-1e16-49ed-aff1-b78062540950	b9f564b3-88b6-4fa1-8118-fcbe553c2ef8	Ade Maryadi	3175062505860011	+628158882505	Direktur	b7777678-3862-460c-b2d2-76aa1ce3f640	50648878-a4cb-4aac-9dc1-fce3ea1bdad5	3171.06	3171.06.5	12345	Depok Nayyara 12	2025-09-10 05:49:39.856107+00	2025-09-10 05:49:39.856107+00
\.


--
-- TOC entry 4751 (class 0 OID 57434)
-- Dependencies: 320
-- Data for Name: pic_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pic_documents (id, pic_id, document_type, file_path, file_name, file_size, mime_type, uploaded_by, created_at, updated_at) FROM stdin;
b83dcac0-4a8f-4999-a473-e9860cafe75f	3f195e54-1e16-49ed-aff1-b78062540950	ktp	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/temp/registration/1757483359268-Business%20Card%20CBS.pdf	ktp-document.pdf	0	application/pdf	a0a88d79-bcbc-46c6-ab50-c671ab894d97	2025-09-10 05:49:40.04338+00	2025-09-10 05:49:40.04338+00
d6c0e301-4df7-45bb-a952-2c430841e78e	3f195e54-1e16-49ed-aff1-b78062540950	assignment_letter	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/temp/registration/1757483364814-SK%20Perubahan%20Terakhir%20Grafika%20Tugu%20Indonesia.pdf	assignment_letter-document.pdf	0	application/pdf	a0a88d79-bcbc-46c6-ab50-c671ab894d97	2025-09-10 05:49:40.093138+00	2025-09-10 05:49:40.093138+00
\.


--
-- TOC entry 4711 (class 0 OID 17307)
-- Dependencies: 280
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, user_id, full_name, company_name, phone, is_validated, created_at, updated_at, maksud_tujuan) FROM stdin;
e4f035a1-6e55-4225-962f-e971c0929be1	bd566177-f856-498e-a555-0358b900919f	Ghani	\N	\N	f	2025-08-20 04:10:49.749136+00	2025-08-20 04:10:49.749136+00	\N
c005d7cd-7e27-4331-97ef-2c8e719c7393	f554600d-68eb-4893-a035-b1b3121fccce	Agus S	\N	\N	f	2025-08-20 07:17:53.603073+00	2025-08-20 07:17:53.603073+00	\N
428aec93-e26f-49a4-85dd-e666e96e63d8	23900513-e747-4788-a1d5-5c77bca39c25	Testing2	\N	\N	f	2025-09-06 14:11:56.49185+00	2025-09-06 14:11:56.49185+00	\N
67d24e6e-c7b7-411a-926d-c5e1ab72f9f4	4e7af1b9-537b-4574-a2db-05fd55bc1824	Testing1	\N	\N	t	2025-09-06 10:03:37.332868+00	2025-09-06 14:46:28.368741+00	\N
7a67717b-569a-4ca2-9669-1fdb970d99bf	c3841217-3283-4b45-bb03-3cb7e059b5e5	Ade Maryadi	BCT	+628158882505	t	2025-08-04 22:20:51.739464+00	2025-09-06 19:01:17.828417+00	\N
2a4cbf9b-fcce-4be7-835f-95126f0acf82	82005f7d-33a7-4119-8262-8ca6ba11d099	Fredy Curs	\N	\N	t	2025-09-06 09:58:23.788174+00	2025-09-06 19:53:53.748888+00	\N
e6af764f-7af1-451d-a1f3-1c5525d59296	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	Stefanus Ade Maryadi	\N	\N	f	2025-09-09 15:24:41.353231+00	2025-09-09 15:24:41.353231+00	\N
db392291-926d-44e8-8985-7e42a37cde6c	a0a88d79-bcbc-46c6-ab50-c671ab894d97	Ade Maryadi	\N	\N	f	2025-09-10 05:49:39.526761+00	2025-09-10 05:49:39.526761+00	\N
\.


--
-- TOC entry 4724 (class 0 OID 18863)
-- Dependencies: 293
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provinces (id, code, name, latitude, longitude, created_at, updated_at) FROM stdin;
1cd635cd-6dc7-40e3-bec5-f3b038227933	11	Aceh	4.695135	96.7493993	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	12	Sumatera Utara	2.1153547	99.5450974	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
f12930f9-00d2-4b98-84ef-5ddb9cd7dcb2	13	Sumatera Barat	-0.7399397	100.8000051	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
391111d7-c48e-468e-a052-18b1b14cae83	14	Riau	0.2933469	101.7068294	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
98082803-f61b-4c80-a9c7-3fbbd0bf721b	15	Jambi	-1.4851831	102.4380581	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
2baa91fa-924e-413c-bc59-b01cb28d2f2b	16	Sumatera Selatan	-3.3194374	103.914399	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
24b120e5-504e-4937-a52f-f4c608af7cff	17	Bengkulu	-3.8004444	102.2655435	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
55280f33-5337-4654-81d0-7879c4433b50	18	Lampung	-4.5585849	105.4068079	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
a3aa8466-44c7-4488-bb79-f74644d3def8	19	Kepulauan Bangka Belitung	-2.7410513	106.4405872	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
9636e0d3-b10e-4d0d-8dd1-c21881d9c493	21	Kepulauan Riau	3.9456514	108.1428669	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
b7777678-3862-460c-b2d2-76aa1ce3f640	31	DKI Jakarta	-6.211544	106.845172	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
11088c86-0540-4d5e-bd83-60392db02d77	32	Jawa Barat	-6.914744	107.609344	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
5ae1fcd8-bcc1-407e-b65b-963088857753	33	Jawa Tengah	-7.150975	110.1402594	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
723f1be8-1c05-4c0c-9acd-a36d559f3b08	34	DI Yogyakarta	-7.8753849	110.4262088	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
af7d45cb-f359-4106-a323-79b6f8368aa7	35	Jawa Timur	-7.5360639	112.2384017	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
c74421e2-c758-4f3b-978b-cd4a2c98b039	36	Banten	-6.4058172	106.0640179	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
62a8a7e6-3631-4e71-bab9-b5e486881558	51	Bali	-8.4095178	115.188916	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
cc2fa48a-4cdf-4ddc-99e4-5aee99244828	52	Nusa Tenggara Barat	-8.6529334	117.3616476	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
4d91e6c5-d28f-4e06-8ad9-b16b2e6ce38f	53	Nusa Tenggara Timur	-8.6573819	121.0793705	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
860725be-d834-468a-9e27-27e5d792d666	61	Kalimantan Barat	-0.2787808	111.4752851	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
352cbafd-2712-4b3d-a8e2-dee63a2c915a	62	Kalimantan Tengah	-1.6814878	113.3823545	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
b8adff86-fa8e-46f1-8f5e-57c3b8792b15	63	Kalimantan Selatan	-3.0926415	115.2837585	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
aedafeb2-28b2-4955-9cb6-530fa9a67161	64	Kalimantan Timur	1.6406296	116.419389	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
54974c16-0c0a-4e27-919b-8f4617ffafae	65	Kalimantan Utara	2.72882	117.1397	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
dca2c405-86ff-4c76-920c-2591f76980ce	71	Sulawesi Utara	1.2379274	124.8413916	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
6b2e4010-d281-4bb7-a2cf-fbfb8f21c35b	72	Sulawesi Tengah	-1.4300254	121.4456179	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
9fe9c976-554a-4b16-a653-bf6d1ff9e6a1	73	Sulawesi Selatan	-3.6687994	119.9740534	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
d86e04d8-5c81-4490-9511-e545a877a9fe	74	Sulawesi Tenggara	-4.14491	122.174605	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
15a6a45e-b928-4632-bd0f-e01900200350	75	Gorontalo	0.6999372	122.4467238	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
156472bb-9943-47b0-804e-ad0dd1ff79f2	76	Sulawesi Barat	-2.8441371	119.2320784	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
13b00283-2db9-4eec-a9fd-7a24107635c8	81	Maluku	-3.2384616	130.1452734	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
b69d3352-299b-4b38-97f6-e3a046177516	82	Maluku Utara	1.5709993	127.8087693	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
fee37a98-0dc9-455d-87eb-66ad2b17b4d1	91	Papua Barat	-1.3361154	133.1747162	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
9073f107-0dbe-42e6-af72-c85f444e154b	94	Papua	-4.269928	138.0803529	2025-08-05 12:00:31.714445+00	2025-08-05 12:00:31.714445+00
\.


--
-- TOC entry 4731 (class 0 OID 31292)
-- Dependencies: 300
-- Data for Name: record_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.record_permissions (id, table_name, record_id, user_id, permission_type, granted_by, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 4722 (class 0 OID 18819)
-- Dependencies: 291
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, code, description, created_at, updated_at) FROM stdin;
7c1896ff-fbf1-412f-a82f-9754b0d2a016	Jasa Telekomunikasi	jasa	Layanan jasa telekomunikasi	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
bc77882e-872b-4c11-806d-0eba3fdf8ca4	Jaringan Telekomunikasi	jaringan	Infrastruktur jaringan telekomunikasi	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
808f865d-49a4-4367-95c9-c38c4cfdacde	Telekomunikasi Khusus	telekomunikasi_khusus	Layanan telekomunikasi untuk keperluan khusus	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
\.


--
-- TOC entry 4723 (class 0 OID 18833)
-- Dependencies: 292
-- Data for Name: sub_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_services (id, service_id, name, code, description, created_at, updated_at) FROM stdin;
afde89d1-1304-45c0-9bec-5e0b34b44437	7c1896ff-fbf1-412f-a82f-9754b0d2a016	Penyelenggaraan Jasa Internet	PENYELENGGARAAN_JASA_INTERNET	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
5a98a85e-585b-4379-8cf9-e175e6f98d3d	7c1896ff-fbf1-412f-a82f-9754b0d2a016	Jasa Akses Internet	JASA_AKSES_INTERNET	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
960c6e4f-4993-4488-815d-f2f9bbf0ca8b	7c1896ff-fbf1-412f-a82f-9754b0d2a016	Jasa Teleponi Dasar	JASA_TELEPONI_DASAR	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
5da946d4-6d23-44c0-98bc-15357d5ee170	7c1896ff-fbf1-412f-a82f-9754b0d2a016	Multimedia	MULTIMEDIA	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
2551c1f0-d243-4e55-86ec-0fbaa34c55fc	7c1896ff-fbf1-412f-a82f-9754b0d2a016	Jasa Teleponi Bergerak Selular	JASA_TELEPONI_BERGERAK_SELULAR	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
8a677bcd-188e-4bf4-a815-fc9e0d79daa2	bc77882e-872b-4c11-806d-0eba3fdf8ca4	Penyelenggaraan Jaringan Tetap Tertutup	PENYELENGGARAAN_JARINGAN_TETAP_TERTUTUP	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
fd3163f0-98d6-4193-9188-4adad0cbd5e2	bc77882e-872b-4c11-806d-0eba3fdf8ca4	Penyelenggaraan Jaringan Bergerak Selular	PENYELENGGARAAN_JARINGAN_BERGERAK_SELULAR	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
429c6fef-dabb-4591-a38e-6deff5d78195	bc77882e-872b-4c11-806d-0eba3fdf8ca4	Penyelenggaraan Jaringan Tetap Lokal	PENYELENGGARAAN_JARINGAN_TETAP_LOKAL	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
57df6ead-9f73-4b46-9e08-de2e4888311e	bc77882e-872b-4c11-806d-0eba3fdf8ca4	Penyelenggaraan Jaringan Tetap Sambungan Langsung Jarak Jauh	PENYELENGGARAAN_JARINGAN_TETAP_SAMBUNGAN_LANGSUNG_JARAK_JAUH	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
e5f37793-cf7d-4630-90c9-49b186e23a1f	808f865d-49a4-4367-95c9-c38c4cfdacde	Very Small Aperture Terminal (VSAT)	VERY_SMALL_APERTURE_TERMINAL_VSAT	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
fef9e255-3c59-4667-be0a-0142d22196c5	808f865d-49a4-4367-95c9-c38c4cfdacde	Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Pertelevisian	PENYELENGGARAAN_TELEKOMUNIKASI_KHUSUS_UNTUK_KEPERLUAN_PERTELEVISIAN	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
d48e8edf-6f5a-4796-947a-c27e42684daf	808f865d-49a4-4367-95c9-c38c4cfdacde	Penyelenggaraan Telekomunikasi Khusus Lainnya	PENYELENGGARAAN_TELEKOMUNIKASI_KHUSUS_LAINNYA	\N	2025-08-05 11:19:02.626106+00	2025-08-05 11:19:02.626106+00
\.


--
-- TOC entry 4740 (class 0 OID 46023)
-- Dependencies: 309
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_tickets (id, ticket_number, company_id, created_by, title, description, status, priority, assigned_to, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4716 (class 0 OID 17383)
-- Dependencies: 285
-- Data for Name: telekom_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.telekom_data (id, service_type, company_name, license_number, license_date, status, region, latitude, longitude, data_source, created_by, created_at, updated_at, file_url, sub_service_type, sub_service_id, province_id, kabupaten_id) FROM stdin;
4dccd29a-c653-4a6c-bf0a-ba8661b53102	jasa	BCT	001	2025-08-05	active	\N	\N	\N	manual	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-08-04 22:48:41.25663+00	2025-08-05 11:02:42.803067+00	\N	Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)	\N	\N	\N
ff9f1823-f772-42c5-a529-3e630bce0738	jaringan	BCT	001	2025-08-06	active	\N	\N	\N	manual	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-08-04 22:59:33.060494+00	2025-08-05 11:02:42.803067+00	https://jktaapzaskbebwhfswth.supabase.co/storage/v1/object/public/documents/c3841217-3283-4b45-bb03-3cb7e059b5e5/telekom-data/1754348149933-Surat%20Penawaran_merged.pdf	Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik	\N	\N	\N
895bc601-ef69-447d-a52b-9b3e0cbbd9f4	telekomunikasi_khusus	Telkomsel Jakarta	TLK-2023-001	2023-01-15	active	Jakarta	-6.13520000	106.81330100	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.127451+00	\N	Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri	\N	b7777678-3862-460c-b2d2-76aa1ce3f640	91556806-5e37-4f0c-8b58-5059cebf91fb
a80a19d3-7054-47cb-9859-dc85addf7a10	telekomunikasi_khusus	Indosat Ooredoo Surabaya	IDO-2023-002	2023-02-10	active	Surabaya	-7.24597170	112.73782660	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.230346+00	\N	Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri	\N	af7d45cb-f359-4106-a323-79b6f8368aa7	920a6787-9a03-4dd4-84d9-e60ec600a067
62dc6105-a92d-4ada-80d6-6c0351c2b2f4	telekomunikasi_khusus	XL Axiata Bandung	XLA-2023-003	2023-03-05	active	Bandung	-7.00514530	107.55876060	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.322384+00	\N	Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri	\N	11088c86-0540-4d5e-bd83-60392db02d77	9b7e4404-6618-4218-adaa-edff8dbf6bf4
cb18aa8a-d904-49f3-9754-e6156b47a293	isr	Pasifik Satelit Nusantara	PSN-2023-009	2023-03-10	active	Makassar	-5.14766510	119.43273140	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.419474+00	\N	Izin Stasiun Radio	\N	9fe9c976-554a-4b16-a653-bf6d1ff9e6a1	51c9f523-f796-4954-98b4-5b37b9af668f
4840b397-9329-42f2-8a66-dcb7c6f1a166	jasa	First Media	FMD-2023-007	2023-01-25	active	Tangerang	-6.17830000	106.63190000	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-05 11:02:42.803067+00	\N	Izin Penyelenggaraan Jasa Televisi Protokol Internet (Internet Protocol Television/IPTV)	\N	\N	\N
0b4d0f02-609d-4b72-8529-a6fed08754ad	jasa	PT Telkomsel Jakarta	TEL-JKT-001	2023-01-15	active	DKI Jakarta	-6.20880000	106.84560000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	b7777678-3862-460c-b2d2-76aa1ce3f640	a86d1c4d-a6bb-40c0-884a-0ca252fca655
e23c16cf-3f98-4c9a-8077-d9d6f0a5b42d	jasa	PT Indosat Jakarta	IND-JKT-002	2023-02-20	active	DKI Jakarta	-6.26140000	106.81060000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	b7777678-3862-460c-b2d2-76aa1ce3f640	50648878-a4cb-4aac-9dc1-fce3ea1bdad5
ecb32ea7-d918-491a-b9eb-e10161eb7107	jasa	PT XL Axiata Jakarta	XL-JKT-003	2023-03-10	active	DKI Jakarta	-6.14780000	106.87400000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	b7777678-3862-460c-b2d2-76aa1ce3f640	8ff8a206-0f64-451e-ae00-9542cc52aee2
d1864d8f-484e-46e9-afd1-5bd9190b284f	jasa	PT Telkomsel Bandung	TEL-BDG-004	2023-01-25	active	Jawa Barat	-6.91750000	107.61910000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	11088c86-0540-4d5e-bd83-60392db02d77	d9c37077-a284-44df-8c15-cf4c8df1f471
c9fd1ace-62cd-4e71-ba94-61b9539696b2	jasa	PT Indosat Bekasi	IND-BKS-005	2023-04-15	active	Jawa Barat	-6.24410000	106.99910000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	11088c86-0540-4d5e-bd83-60392db02d77	70899938-4119-45e8-a468-175a8a74d5ea
4ce4002e-308d-4748-9cde-3d392349e858	jasa	PT Smartfren Semarang	SMT-SMG-006	2023-02-10	active	Jawa Tengah	-6.99330000	110.42030000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	5ae1fcd8-bcc1-407e-b65b-963088857753	a9e43abd-0c4e-4e2b-9f11-99cc49e5a0fc
9fa85a77-8e5f-4bee-88fe-6cbd7ad8eef6	jasa	PT Tri Jogja	TRI-JOG-007	2023-03-05	active	DI Yogyakarta	-7.79560000	110.36950000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	723f1be8-1c05-4c0c-9acd-a36d559f3b08	\N
4522eca2-6717-4583-9a7f-3e41c408b2b9	jasa	PT Telkomsel Surabaya	TEL-SBY-008	2023-01-30	active	Jawa Timur	-7.25750000	112.75210000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	af7d45cb-f359-4106-a323-79b6f8368aa7	920a6787-9a03-4dd4-84d9-e60ec600a067
645a442a-f891-48fa-b0a2-3e47fb64ab32	jasa	PT XL Malang	XL-MLG-009	2023-04-20	active	Jawa Timur	-7.97970000	112.63040000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	af7d45cb-f359-4106-a323-79b6f8368aa7	17d832f8-d94d-4a10-88c9-fb2b490cb972
2bc85d57-2756-4059-a088-c6d20e151ab7	jasa	PT Indosat Medan	IND-MDN-010	2023-02-05	active	Sumatera Utara	3.59520000	98.67220000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	b1727293-bd03-4099-9b06-d33131221685
2b894589-d940-4ac9-af49-9a7563742e79	jasa	PT Smartfren Palembang	SMT-PLG-011	2023-03-15	active	Sumatera Selatan	-2.97610000	104.77540000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	2baa91fa-924e-413c-bc59-b01cb28d2f2b	04e54283-5f67-4b52-a069-ff798feed441
5a8244f3-d3a2-491e-8b49-b8c0266cb0b6	jasa	PT Tri Balikpapan	TRI-BPP-012	2023-01-20	active	Kalimantan Timur	-1.23790000	116.85290000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	aedafeb2-28b2-4955-9cb6-530fa9a67161	cf84c6fc-f2ae-4dec-bb67-7a9c499afee5
2c19ad08-69e2-490b-9722-b24efc3fb620	jasa	PT Telkomsel Pontianak	TEL-PTK-013	2023-04-10	active	Kalimantan Barat	-0.02630000	109.34250000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	860725be-d834-468a-9e27-27e5d792d666	\N
c27b1cdd-250c-4d76-8f9e-3bf7fc447fe3	jasa	PT XL Makassar	XL-MKS-014	2023-02-25	active	Sulawesi Selatan	-5.14770000	119.43270000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	9fe9c976-554a-4b16-a653-bf6d1ff9e6a1	51c9f523-f796-4954-98b4-5b37b9af668f
d132fdff-2e10-42b1-ab21-dc6d79b12d72	jasa	PT Indosat Manado	IND-MND-015	2023-03-20	active	Sulawesi Utara	1.47480000	124.84210000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	dca2c405-86ff-4c76-920c-2591f76980ce	\N
a363ccdb-4b2c-4810-aa14-411fb9585eb9	jasa	PT Smartfren Jayapura	SMT-JPR-016	2023-04-05	active	Papua	-2.54890000	140.70770000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	9073f107-0dbe-42e6-af72-c85f444e154b	252e4beb-1f62-431c-ad47-a039f06441f5
e4965164-e99b-423c-bcdd-a2094a5aab47	jasa	PT Tri Denpasar	TRI-DPS-017	2023-01-10	active	Bali	-8.65000000	115.21670000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	62a8a7e6-3631-4e71-bab9-b5e486881558	3357e945-e7f2-40bf-a67d-0ee52cd28684
799c726f-4047-4a04-8158-3787173c3f6e	jaringan	PT Network Provider Surakarta	NET-SKR-018	2023-02-15	active	Jawa Tengah	-7.57550000	110.82430000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jaringan Tetap Tertutup	\N	5ae1fcd8-bcc1-407e-b65b-963088857753	4a221493-854f-43a5-bf12-894cc6c65c0e
d8c8e86e-a6b8-4ca7-ac1f-88a51e466a3d	jaringan	PT Telecom Infrastructure Batam	TEL-BTM-019	2023-03-25	active	Kepulauan Riau	1.13040000	104.05300000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jaringan Bergerak Seluler	\N	9636e0d3-b10e-4d0d-8dd1-c21881d9c493	\N
7cefa6e9-8b5d-42c7-b0f8-dac9d0cd7be5	jasa	PT Digital Services Lombok	DIG-LMB-020	2023-04-30	active	Nusa Tenggara Barat	-8.58330000	116.11670000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Akses Internet	\N	cc2fa48a-4cdf-4ddc-99e4-5aee99244828	\N
efb63a08-386d-4853-a4a3-43cdfb5774cf	jasa	PT Future Tech Tangerang	FUT-TNG-021	2024-01-15	active	Banten	-6.17830000	106.63190000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	c74421e2-c758-4f3b-978b-cd4a2c98b039	\N
afeed467-a215-44f9-ac49-ff7798134125	jaringan	PT Innovative Comms Cirebon	INN-CRB-022	2024-02-10	active	Jawa Barat	-6.70630000	108.55710000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jaringan Tetap Lokal	\N	11088c86-0540-4d5e-bd83-60392db02d77	debbd72b-2c93-471f-b38d-7d186e2a3bee
186ff6bb-5a50-4b8d-b214-ae85aa8548a9	jasa	PT Next Gen Networks Padang	NGN-PDG-023	2024-03-05	active	Sumatera Barat	-0.94710000	100.41720000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	f12930f9-00d2-4b98-84ef-5ddb9cd7dcb2	94e34676-ff9b-484d-abec-fc18ec9cfcc6
e659c384-796c-4a8d-8ae6-1bdaff536cce	jasa	PT Legacy Systems Banjarmasin	LEG-BJM-024	2022-12-20	inactive	Kalimantan Selatan	-3.31940000	114.59060000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jasa Internet	\N	b8adff86-fa8e-46f1-8f5e-57c3b8792b15	\N
dc8bc34e-827a-479a-aaa6-693f714e2b4e	jaringan	PT Temporary Service Pekanbaru	TMP-PKU-025	2023-06-15	suspended	Riau	0.50720000	101.44780000	manual	\N	2025-08-05 17:17:42.359014+00	2025-08-05 17:17:42.359014+00	\N	Penyelenggara Jaringan Bergerak Seluler	\N	391111d7-c48e-468e-a052-18b1b14cae83	51cbfad9-4892-45ca-b18d-b4d85d3855f7
90ed78f8-453a-43ed-9f79-948d0a58a771	telekomunikasi_khusus	PT jaringan	\N	\N	active	\N	\N	\N	manual	f554600d-68eb-4893-a035-b1b3121fccce	2025-08-20 08:58:22.84645+00	2025-08-20 08:58:22.84645+00	\N	Penyelenggaraan Telekomunikasi Khusus Lainnya	d48e8edf-6f5a-4796-947a-c27e42684daf	\N	\N
5f7d6b9f-7c3c-4dc2-bb98-3f7141b2ccb7	jasa	Biznet Networks	BIZ-2023-004	2023-01-20	active	Jakarta	-6.13520000	106.81330100	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.513919+00	\N	Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)	\N	b7777678-3862-460c-b2d2-76aa1ce3f640	91556806-5e37-4f0c-8b58-5059cebf91fb
2f539d85-2373-4d30-8c01-3836f79ba51d	jaringan	CBN Fiber	CBN-2023-005	2023-02-15	active	Jakarta	-6.13520000	106.81330100	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.602486+00	\N	Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik	\N	b7777678-3862-460c-b2d2-76aa1ce3f640	91556806-5e37-4f0c-8b58-5059cebf91fb
f6ac44c5-8037-41ad-8e89-877a2cd9141e	jaringan	Telkom Indonesia	TLK-2023-006	2023-03-01	active	Yogyakarta	-7.87538490	110.42620880	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.690708+00	\N	Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Circuit Switched melalui Media Fiber Optik	\N	723f1be8-1c05-4c0c-9acd-a36d559f3b08	\N
24e15cab-9046-4ab3-a1b9-4302e5ec1f58	telekomunikasi_khusus	Smartfren	SMF-2023-008	2023-02-20	active	Medan	3.59519560	98.67222270	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.777683+00	\N	Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri	\N	18dd87f7-3a0c-4adc-a8a0-2cdb38e04ba8	b1727293-bd03-4099-9b06-d33131221685
85b6e35b-4776-49a9-b7af-3f9f609397e0	isr	Hughes Network Systems	HNS-2023-010	2023-03-15	suspended	Denpasar	-8.67045820	115.21262930	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.868085+00	\N	Izin Stasiun Radio	\N	62a8a7e6-3631-4e71-bab9-b5e486881558	3357e945-e7f2-40bf-a67d-0ee52cd28684
adec8838-8a90-4ae5-baf9-f78a90d000bf	jasa	Moratelindo	MTI-2023-011	2023-02-25	active	Semarang	-7.14620000	110.49850000	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:28.957596+00	\N	Izin Penyelenggaraan Jasa Sistem Komunikasi Data	\N	5ae1fcd8-bcc1-407e-b65b-963088857753	e5bf747a-86a1-4952-b499-51368b86bc08
d09f4edf-0dff-430d-9bfe-0554cbdeeccc	jasa	Icon Plus	ICP-2023-012	2023-01-30	inactive	Palembang	-2.97607350	104.77543070	manual	\N	2025-08-05 10:42:53.114851+00	2025-08-24 23:43:29.053589+00	\N	Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)	\N	2baa91fa-924e-413c-bc59-b01cb28d2f2b	04e54283-5f67-4b52-a069-ff798feed441
f2d17d80-dd08-4b4f-a7c7-28e0c324d892	jaringan	PT Siblings	211412	2025-09-07	active	Jawa Timur	-7.24597170	112.73782660	manual	82005f7d-33a7-4119-8262-8ca6ba11d099	2025-09-06 20:27:15.518266+00	2025-09-06 20:27:28.539803+00	\N	Penyelenggaraan Jaringan Tetap Lokal	429c6fef-dabb-4591-a38e-6deff5d78195	af7d45cb-f359-4106-a323-79b6f8368aa7	920a6787-9a03-4dd4-84d9-e60ec600a067
\.


--
-- TOC entry 4720 (class 0 OID 17611)
-- Dependencies: 289
-- Data for Name: ticket_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_assignments (id, ticket_id, assigned_by, assigned_to, assigned_at, unassigned_at, notes, created_at) FROM stdin;
b772df00-8be4-4c74-ad1a-386730d425b0	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-08-05 01:55:44.759871+00	2025-09-06 10:51:11.888+00	\N	2025-08-05 01:55:44.759871+00
\.


--
-- TOC entry 4719 (class 0 OID 17553)
-- Dependencies: 288
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_messages (id, ticket_id, user_id, message, is_admin_message, file_url, is_read, created_at, updated_at) FROM stdin;
a3eecb56-144a-421f-9917-58aeacb43fd5	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	Test Admin	t	\N	t	2025-08-04 23:41:30.556479+00	2025-09-06 19:13:31.35163+00
13305b1a-ed83-413d-add0-e0c73d5a1b1f	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	Test Admin 2	t	\N	t	2025-08-04 23:45:49.694661+00	2025-09-06 19:13:31.35163+00
4b535329-54b4-4d19-af87-1d01c5244d60	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	Test Admin 3	t	\N	t	2025-08-04 23:48:21.613985+00	2025-09-06 19:13:31.35163+00
b7a7386d-b68b-404d-b126-ff28fbbf0efe	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	Test Admin 4	t	\N	t	2025-08-04 23:49:01.262672+00	2025-09-06 19:13:31.35163+00
15ccbe49-f839-4f21-82c2-be8d47ef075e	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	Closed	t	\N	t	2025-08-05 00:47:27.15366+00	2025-09-06 19:13:31.35163+00
9c0c04b2-1ea2-4fed-ae69-6c3869c2e479	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	test	f	\N	t	2025-09-06 10:44:50.638223+00	2025-09-06 19:25:45.252763+00
fc21db23-badd-45c4-82ce-e31c83b052c8	04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	test2	f	\N	t	2025-09-06 18:30:47.608698+00	2025-09-06 19:25:45.252763+00
\.


--
-- TOC entry 4721 (class 0 OID 17636)
-- Dependencies: 290
-- Data for Name: ticket_sla_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_sla_metrics (id, ticket_id, first_response_time_minutes, resolution_time_minutes, sla_target_response_minutes, sla_target_resolution_minutes, response_sla_met, resolution_sla_met, created_at, updated_at) FROM stdin;
338a074d-d6b9-421f-abb5-5b02bc296b36	04255b08-16d6-4c87-b168-9587a273a38f	30	\N	240	1440	t	\N	2025-08-05 00:47:27.15366+00	2025-09-06 18:30:47.608698+00
\.


--
-- TOC entry 4715 (class 0 OID 17364)
-- Dependencies: 284
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, user_id, title, description, status, priority, created_at, updated_at, file_url, category, assigned_to, assignment_status, first_response_at, resolved_at, escalated_at, escalation_level, due_date, tags, internal_notes) FROM stdin;
04255b08-16d6-4c87-b168-9587a273a38f	c3841217-3283-4b45-bb03-3cb7e059b5e5	test	test	open	medium	2025-08-04 23:11:50.429643+00	2025-09-06 10:52:09.747511+00	\N	general	\N	unassigned	\N	\N	\N	0	\N	\N	\N
\.


--
-- TOC entry 4741 (class 0 OID 46042)
-- Dependencies: 310
-- Data for Name: ulo_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ulo_applications (id, license_application_id, test_method, status, sklo_number, sk_commitment_number, qr_code_data, digital_signature, issued_at, issued_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4734 (class 0 OID 45935)
-- Dependencies: 303
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, user_id, company_id, full_name, "position", phone, role, is_company_admin, created_at, updated_at, specialization) FROM stdin;
4702cedb-bf2e-46e2-9ca5-fab45f1a6c9c	00000000-0000-0000-0000-000000000001	\N	Sample Pelaku Usaha	Owner	\N	pelaku_usaha	t	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
104f7724-c02b-4996-843b-1e6a619d71e4	00000000-0000-0000-0000-000000000002	\N	Sample Ketua Tim	Ketua Tim	\N	ketua_tim	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
b2ffc355-b6ea-4c27-b6f0-10d0e0cb4a76	00000000-0000-0000-0000-000000000003	\N	Sample Evaluator	Evaluator	\N	evaluator	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
fc3a0225-f71e-416c-9851-0dfefc0aef01	00000000-0000-0000-0000-000000000004	\N	Sample Wakil Ketua	Wakil Ketua	\N	wakil_ketua	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
bb6a57d4-0ac4-42c6-b4b1-545e2dc13135	00000000-0000-0000-0000-000000000005	\N	Sample Direktur	Direktur	\N	direktur	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
da4868af-7acc-4ab5-9397-068cfee1f13e	00000000-0000-0000-0000-000000000006	\N	Sample Verifikator NIB	Verifikator NIB	\N	verifikator_nib	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
7f253f27-42de-4085-8fde-b41074ab0855	00000000-0000-0000-0000-000000000007	\N	Sample Admin	Admin	\N	admin	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
0318530c-3778-42da-aa92-e9c5e3006c67	00000000-0000-0000-0000-000000000008	\N	Sample Superadmin	Superadmin	\N	superadmin	f	2025-08-30 09:50:10.411792+00	2025-08-30 09:50:10.411792+00	\N
9e085410-dc34-4659-886a-83f9034f702f	a0a88d79-bcbc-46c6-ab50-c671ab894d97	b9f564b3-88b6-4fa1-8118-fcbe553c2ef8	Ade Maryadi	Direktur	+628158882505	pelaku_usaha	t	2025-09-10 05:49:39.741289+00	2025-09-10 05:49:39.741289+00	\N
\.


--
-- TOC entry 4712 (class 0 OID 17325)
-- Dependencies: 281
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role, created_at) FROM stdin;
a3b4ea5b-71c5-43da-9eed-f12cb9c9a748	c3841217-3283-4b45-bb03-3cb7e059b5e5	super_admin	2025-08-06 16:47:31.720082+00
f59f7752-eaa2-4864-a146-ac8917484d2b	bd566177-f856-498e-a555-0358b900919f	pelaku_usaha	2025-08-20 04:17:50.969798+00
f121e7a8-eb81-4445-b328-45bda7e01e8f	23900513-e747-4788-a1d5-5c77bca39c25	pengolah_data	2025-09-06 14:19:26.047773+00
00638101-35ac-4af3-a395-87508664f6db	4e7af1b9-537b-4574-a2db-05fd55bc1824	pelaku_usaha	2025-09-06 14:47:06.932143+00
6c090788-4cba-46a7-a9cf-653d299c29db	a822f3d9-4d83-4827-b3e3-7b2aec2d4999	pelaku_usaha	2025-09-09 15:24:41.353231+00
5e7d8455-a4b7-4f43-ad9b-e57d791ad17d	a0a88d79-bcbc-46c6-ab50-c671ab894d97	pelaku_usaha	2025-09-10 05:49:39.526761+00
012dd445-f45c-4c58-aa3a-63a044896af7	82005f7d-33a7-4119-8262-8ca6ba11d099	internal_admin	2025-09-10 10:19:33.665762+00
\.


--
-- TOC entry 4747 (class 0 OID 57328)
-- Dependencies: 316
-- Data for Name: messages_2025_09_11; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_11 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4748 (class 0 OID 57339)
-- Dependencies: 317
-- Data for Name: messages_2025_09_12; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_12 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4752 (class 0 OID 57489)
-- Dependencies: 321
-- Data for Name: messages_2025_09_13; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_13 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4753 (class 0 OID 58637)
-- Dependencies: 322
-- Data for Name: messages_2025_09_14; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_14 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4754 (class 0 OID 59753)
-- Dependencies: 323
-- Data for Name: messages_2025_09_15; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_15 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4755 (class 0 OID 60869)
-- Dependencies: 324
-- Data for Name: messages_2025_09_16; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_16 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4756 (class 0 OID 63088)
-- Dependencies: 325
-- Data for Name: messages_2025_09_17; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_17 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4705 (class 0 OID 17000)
-- Dependencies: 270
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-08-04 16:55:37
20211116045059	2025-08-04 16:55:37
20211116050929	2025-08-04 16:55:37
20211116051442	2025-08-04 16:55:37
20211116212300	2025-08-04 16:55:37
20211116213355	2025-08-04 16:55:37
20211116213934	2025-08-04 16:55:37
20211116214523	2025-08-04 16:55:37
20211122062447	2025-08-04 16:55:37
20211124070109	2025-08-04 16:55:37
20211202204204	2025-08-04 16:55:37
20211202204605	2025-08-04 16:55:37
20211210212804	2025-08-04 16:55:37
20211228014915	2025-08-04 16:55:37
20220107221237	2025-08-04 16:55:38
20220228202821	2025-08-04 16:55:38
20220312004840	2025-08-04 16:55:38
20220603231003	2025-08-04 16:55:38
20220603232444	2025-08-04 16:55:38
20220615214548	2025-08-04 16:55:38
20220712093339	2025-08-04 16:55:38
20220908172859	2025-08-04 16:55:38
20220916233421	2025-08-04 16:55:38
20230119133233	2025-08-04 16:55:38
20230128025114	2025-08-04 16:55:38
20230128025212	2025-08-04 16:55:38
20230227211149	2025-08-04 16:55:38
20230228184745	2025-08-04 16:55:38
20230308225145	2025-08-04 16:55:38
20230328144023	2025-08-04 16:55:38
20231018144023	2025-08-04 16:55:38
20231204144023	2025-08-04 16:55:38
20231204144024	2025-08-04 16:55:38
20231204144025	2025-08-04 16:55:38
20240108234812	2025-08-04 16:55:38
20240109165339	2025-08-04 16:55:38
20240227174441	2025-08-04 16:55:38
20240311171622	2025-08-04 16:55:38
20240321100241	2025-08-04 16:55:38
20240401105812	2025-08-04 16:55:38
20240418121054	2025-08-04 16:55:38
20240523004032	2025-08-04 16:55:38
20240618124746	2025-08-04 16:55:38
20240801235015	2025-08-04 16:55:38
20240805133720	2025-08-04 16:55:38
20240827160934	2025-08-04 16:55:38
20240919163303	2025-08-04 16:55:38
20240919163305	2025-08-04 16:55:38
20241019105805	2025-08-04 16:55:38
20241030150047	2025-08-04 16:55:38
20241108114728	2025-08-04 16:55:38
20241121104152	2025-08-04 16:55:38
20241130184212	2025-08-04 16:55:38
20241220035512	2025-08-04 16:55:38
20241220123912	2025-08-04 16:55:38
20241224161212	2025-08-04 16:55:38
20250107150512	2025-08-04 16:55:38
20250110162412	2025-08-04 16:55:38
20250123174212	2025-08-04 16:55:38
20250128220012	2025-08-04 16:55:38
20250506224012	2025-08-04 16:55:38
20250523164012	2025-08-04 16:55:38
20250714121412	2025-08-04 16:55:39
\.


--
-- TOC entry 4707 (class 0 OID 17023)
-- Dependencies: 273
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- TOC entry 4691 (class 0 OID 16544)
-- Dependencies: 253
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
documents	documents	\N	2025-08-04 17:14:29.462953+00	2025-08-04 17:14:29.462953+00	t	f	10485760	{application/pdf}	\N	STANDARD
license-documents	license-documents	\N	2025-08-30 04:41:09.110924+00	2025-08-30 04:41:09.110924+00	f	f	\N	\N	\N	STANDARD
\.


--
-- TOC entry 4718 (class 0 OID 17538)
-- Dependencies: 287
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4693 (class 0 OID 16586)
-- Dependencies: 255
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-04 16:55:38.44528
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-04 16:55:38.451037
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-08-04 16:55:38.457831
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-04 16:55:38.476542
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-04 16:55:38.495402
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-04 16:55:38.511748
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-08-04 16:55:38.521379
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-04 16:55:38.530046
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-04 16:55:38.537284
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-08-04 16:55:38.546824
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-08-04 16:55:38.552566
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-04 16:55:38.560013
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-04 16:55:38.566961
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-04 16:55:38.572576
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-04 16:55:38.58084
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-04 16:55:38.604089
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-04 16:55:38.614271
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-04 16:55:38.622519
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-04 16:55:38.638653
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-04 16:55:38.646567
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-04 16:55:38.653596
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-04 16:55:38.667567
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-04 16:55:38.69657
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-04 16:55:38.724501
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-04 16:55:38.732603
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-04 16:55:38.737849
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-08-04 22:55:55.478594
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-08-04 22:55:55.496801
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-08-04 22:55:55.506473
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-08-04 22:55:55.513157
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-08-04 22:55:55.518693
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-08-04 22:55:55.642135
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-08-04 22:55:55.648974
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-08-04 22:55:55.655041
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-08-04 22:55:55.656519
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-08-04 22:55:55.66078
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-08-04 22:55:55.663919
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-08-04 22:55:55.669263
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-08-04 22:55:55.672873
\.


--
-- TOC entry 4692 (class 0 OID 16559)
-- Dependencies: 254
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
d08a1e96-c494-43a4-ab47-4ab2beefd6ce	documents	c3841217-3283-4b45-bb03-3cb7e059b5e5/telekom-data/1754348149933-Surat Penawaran_merged.pdf	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-08-04 22:55:50.276982+00	2025-08-04 22:55:55.514696+00	2025-08-04 22:55:50.276982+00	{"eTag": "\\"2b07c589e9cc3b6211705f43ec8f64a4\\"", "size": 1357741, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T22:55:51.000Z", "contentLength": 1357741, "httpStatusCode": 200}	09b4ffd6-7d64-4ae3-a56c-8f6988961847	c3841217-3283-4b45-bb03-3cb7e059b5e5	{}	3
ceb7e057-b975-4f44-a39c-72189ec6d2bc	documents	c3841217-3283-4b45-bb03-3cb7e059b5e5/telekom-data/1754350253885-SOP_ 2024.pdf	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-08-04 23:30:55.215831+00	2025-08-04 23:30:55.215831+00	2025-08-04 23:30:55.215831+00	{"eTag": "\\"2b3c92cdadb8a5c189d1508b18570ddd\\"", "size": 4279777, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T23:30:55.000Z", "contentLength": 4279777, "httpStatusCode": 200}	ed1d86e9-0152-4916-8805-e2a19fccd211	c3841217-3283-4b45-bb03-3cb7e059b5e5	{}	3
eb24f588-6fbd-4a2e-a009-f5e8078f5321	documents	c3841217-3283-4b45-bb03-3cb7e059b5e5/telekom-data/1757167030595-gemini-for-google-workspace-prompting-guide-101.pdf	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-09-06 13:57:17.119872+00	2025-09-06 13:57:17.119872+00	2025-09-06 13:57:17.119872+00	{"eTag": "\\"7772069752b9ae7f41c594d33f72c83f\\"", "size": 3733971, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-06T13:57:17.000Z", "contentLength": 3733971, "httpStatusCode": 200}	d89fc00e-4a5a-4af2-b732-01f3787a411a	c3841217-3283-4b45-bb03-3cb7e059b5e5	{}	3
f06b5478-bb81-4c4b-88e1-2dc9faee6ada	documents	temp/registration/1757480535992-SK Perubahan Terakhir Grafika Tugu Indonesia.pdf	\N	2025-09-10 05:02:16.88057+00	2025-09-10 05:02:16.88057+00	2025-09-10 05:02:16.88057+00	{"eTag": "\\"b4485483fbd9bc3b99a256a68e523c3d\\"", "size": 329518, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:02:17.000Z", "contentLength": 329518, "httpStatusCode": 200}	fe02a662-820f-4a16-95ee-d2ff370d1511	\N	{}	3
878218f9-b65e-4924-8e90-0a87ee8a64a3	documents	temp/registration/1757480545188-4. NPWP PT Grafika Tugu Indonesia 2025.pdf	\N	2025-09-10 05:02:25.952519+00	2025-09-10 05:02:25.952519+00	2025-09-10 05:02:25.952519+00	{"eTag": "\\"5df9773e095c9bcf77aa968841711d80\\"", "size": 1009246, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:02:26.000Z", "contentLength": 1009246, "httpStatusCode": 200}	f0478a31-885d-413f-b4c6-7e1993f87ebb	\N	{}	3
6f4fe5a6-7cbb-45a8-beaf-3fb5b29e8467	documents	temp/registration/1757480552386-Invoice-QHUHNV-00004.pdf	\N	2025-09-10 05:02:33.03935+00	2025-09-10 05:02:33.03935+00	2025-09-10 05:02:33.03935+00	{"eTag": "\\"4772c907dc00f210d0dd8ac5f23207be\\"", "size": 116318, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:02:34.000Z", "contentLength": 116318, "httpStatusCode": 200}	8b716a46-27dc-497d-8fc7-1b149157e3d8	\N	{}	3
6416b684-97dd-474b-9db5-557bd365549b	documents	temp/registration/1757483281305-Business Card CBS.pdf	\N	2025-09-10 05:48:03.038541+00	2025-09-10 05:48:03.038541+00	2025-09-10 05:48:03.038541+00	{"eTag": "\\"ad58bf551e341ae29437572575669971\\"", "size": 2114337, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:48:03.000Z", "contentLength": 2114337, "httpStatusCode": 200}	c599143d-0b5b-4e0f-9359-aa23fbe19ccb	\N	{}	3
8cc2154c-7e91-4eaa-a021-a24d856495a6	documents	temp/registration/1757483293023-3. NIB PT Grafika Tugu Indonesia 2025.pdf	\N	2025-09-10 05:48:13.742605+00	2025-09-10 05:48:13.742605+00	2025-09-10 05:48:13.742605+00	{"eTag": "\\"9666840a351418fe174cdf5743a81e46\\"", "size": 576546, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:48:14.000Z", "contentLength": 576546, "httpStatusCode": 200}	589b44b5-5025-4a8c-94f1-8e32982aa220	\N	{}	3
d8dba944-a610-405f-971b-b6652d083995	documents	temp/registration/1757483298036-4. NPWP PT Grafika Tugu Indonesia 2025.pdf	\N	2025-09-10 05:48:18.78247+00	2025-09-10 05:48:18.78247+00	2025-09-10 05:48:18.78247+00	{"eTag": "\\"5df9773e095c9bcf77aa968841711d80\\"", "size": 1009246, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:48:19.000Z", "contentLength": 1009246, "httpStatusCode": 200}	4c103a0e-2e0b-449d-a901-e7c9a91cbc33	\N	{}	3
2208a26b-f76a-4215-9627-960ada5286aa	documents	temp/registration/1757483359268-Business Card CBS.pdf	\N	2025-09-10 05:49:20.620917+00	2025-09-10 05:49:20.620917+00	2025-09-10 05:49:20.620917+00	{"eTag": "\\"ad58bf551e341ae29437572575669971\\"", "size": 2114337, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:49:21.000Z", "contentLength": 2114337, "httpStatusCode": 200}	f944fa5a-bd8e-40d9-a74a-c859036f1655	\N	{}	3
1f64b2bc-d764-4925-a912-099e51b5308f	documents	temp/registration/1757483364814-SK Perubahan Terakhir Grafika Tugu Indonesia.pdf	\N	2025-09-10 05:49:25.457825+00	2025-09-10 05:49:25.457825+00	2025-09-10 05:49:25.457825+00	{"eTag": "\\"b4485483fbd9bc3b99a256a68e523c3d\\"", "size": 329518, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T05:49:26.000Z", "contentLength": 329518, "httpStatusCode": 200}	928dcb24-7ece-4904-8ed5-84ab60f8fafa	\N	{}	3
2d2a94c5-4a68-44b2-b76d-a02f58ff5bb8	documents	temp/registration/1757487947970-Business Card CBS.pdf	\N	2025-09-10 07:05:49.320915+00	2025-09-10 07:05:49.320915+00	2025-09-10 07:05:49.320915+00	{"eTag": "\\"ad58bf551e341ae29437572575669971\\"", "size": 2114337, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T07:05:50.000Z", "contentLength": 2114337, "httpStatusCode": 200}	4a5fa1e8-c60e-4620-8723-3d892977d049	\N	{}	3
80a9946c-3bcb-4167-a66d-cae18533afb6	documents	temp/registration/1757487957045-sk-ulo-TKB-2024061800047 (Ori).pdf	\N	2025-09-10 07:05:57.691644+00	2025-09-10 07:05:57.691644+00	2025-09-10 07:05:57.691644+00	{"eTag": "\\"b6a1463b8d4a85846ea0bd95f1d518b9\\"", "size": 26683, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T07:05:58.000Z", "contentLength": 26683, "httpStatusCode": 200}	e379f655-949d-48d9-94e9-3c3bf09aaa97	\N	{}	3
e477eed3-db6e-4ea9-b907-9b75b819b787	documents	temp/registration/1757487969798-SK Perubahan Terakhir Grafika Tugu Indonesia.pdf	\N	2025-09-10 07:06:10.438595+00	2025-09-10 07:06:10.438595+00	2025-09-10 07:06:10.438595+00	{"eTag": "\\"b4485483fbd9bc3b99a256a68e523c3d\\"", "size": 329518, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-09-10T07:06:11.000Z", "contentLength": 329518, "httpStatusCode": 200}	3c4212b6-3574-4a02-86de-3e7e35e8e49e	\N	{}	3
\.


--
-- TOC entry 4717 (class 0 OID 17493)
-- Dependencies: 286
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
documents	c3841217-3283-4b45-bb03-3cb7e059b5e5	2025-08-04 22:55:55.508068+00	2025-08-04 22:55:55.508068+00
documents	c3841217-3283-4b45-bb03-3cb7e059b5e5/telekom-data	2025-08-04 22:55:55.508068+00	2025-08-04 22:55:55.508068+00
documents	temp	2025-09-10 05:02:16.88057+00	2025-09-10 05:02:16.88057+00
documents	temp/registration	2025-09-10 05:02:16.88057+00	2025-09-10 05:02:16.88057+00
\.


--
-- TOC entry 4708 (class 0 OID 17211)
-- Dependencies: 277
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- TOC entry 4709 (class 0 OID 17225)
-- Dependencies: 278
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- TOC entry 4710 (class 0 OID 17269)
-- Dependencies: 279
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key) FROM stdin;
20250804051429	{"-- Create user roles enum\nCREATE TYPE public.app_role AS ENUM ('super_admin', 'internal_admin', 'pelaku_usaha', 'pengolah_data', 'internal_group', 'guest');\n\n-- Create telecommunication service types enum\nCREATE TYPE public.service_type AS ENUM ('jasa', 'jaringan', 'telekomunikasi_khusus', 'isr', 'tarif', 'sklo', 'lko');\n\n-- Create profiles table for additional user information\nCREATE TABLE public.profiles (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,\n  full_name TEXT NOT NULL,\n  company_name TEXT,\n  phone TEXT,\n  is_validated BOOLEAN DEFAULT false,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create user_roles table\nCREATE TABLE public.user_roles (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n  role app_role NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  UNIQUE(user_id, role)\n);\n\n-- Create FAQ categories table\nCREATE TABLE public.faq_categories (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL,\n  description TEXT,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create FAQ table\nCREATE TABLE public.faqs (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  category_id UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,\n  question TEXT NOT NULL,\n  answer TEXT NOT NULL,\n  file_url TEXT,\n  is_active BOOLEAN DEFAULT true,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create tickets table for support\nCREATE TABLE public.tickets (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,\n  title TEXT NOT NULL,\n  description TEXT NOT NULL,\n  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),\n  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create telecommunication data table\nCREATE TABLE public.telekom_data (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  service_type service_type NOT NULL,\n  company_name TEXT NOT NULL,\n  license_number TEXT,\n  license_date DATE,\n  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),\n  region TEXT,\n  latitude DECIMAL(10, 8),\n  longitude DECIMAL(11, 8),\n  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'api', 'database', 'import')),\n  created_by UUID REFERENCES auth.users(id),\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Enable Row Level Security\nALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.telekom_data ENABLE ROW LEVEL SECURITY;\n\n-- Create security definer function for role checking\nCREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)\nRETURNS BOOLEAN\nLANGUAGE SQL\nSTABLE\nSECURITY DEFINER\nAS $$\n  SELECT EXISTS (\n    SELECT 1\n    FROM public.user_roles\n    WHERE user_id = _user_id AND role = _role\n  )\n$$;\n\n-- Create RLS policies for profiles\nCREATE POLICY \\"Users can view their own profile\\" ON public.profiles\n  FOR SELECT USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can update their own profile\\" ON public.profiles\n  FOR UPDATE USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can insert their own profile\\" ON public.profiles\n  FOR INSERT WITH CHECK (auth.uid() = user_id);\n\nCREATE POLICY \\"Admins can view all profiles\\" ON public.profiles\n  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'internal_admin'));\n\n-- Create RLS policies for user_roles\nCREATE POLICY \\"Users can view their own roles\\" ON public.user_roles\n  FOR SELECT USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Admins can manage all roles\\" ON public.user_roles\n  FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'internal_admin'));\n\n-- Create RLS policies for FAQs (public read)\nCREATE POLICY \\"Anyone can view active FAQs\\" ON public.faqs\n  FOR SELECT USING (is_active = true);\n\nCREATE POLICY \\"Admins can manage FAQs\\" ON public.faqs\n  FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'internal_admin'));\n\n-- Create RLS policies for FAQ categories (public read)\nCREATE POLICY \\"Anyone can view FAQ categories\\" ON public.faq_categories\n  FOR SELECT USING (true);\n\nCREATE POLICY \\"Admins can manage FAQ categories\\" ON public.faq_categories\n  FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'internal_admin'));\n\n-- Create RLS policies for tickets\nCREATE POLICY \\"Users can view their own tickets\\" ON public.tickets\n  FOR SELECT USING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can create tickets\\" ON public.tickets\n  FOR INSERT WITH CHECK (auth.uid() = user_id);\n\nCREATE POLICY \\"Admins can view all tickets\\" ON public.tickets\n  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'internal_admin') OR public.has_role(auth.uid(), 'pengolah_data'));\n\nCREATE POLICY \\"Admins can update tickets\\" ON public.tickets\n  FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'internal_admin') OR public.has_role(auth.uid(), 'pengolah_data'));\n\n-- Create RLS policies for telekom data\nCREATE POLICY \\"Validated users can view telekom data\\" ON public.telekom_data\n  FOR SELECT USING (\n    EXISTS (\n      SELECT 1 FROM public.profiles \n      WHERE user_id = auth.uid() AND is_validated = true\n    )\n  );\n\nCREATE POLICY \\"Pelaku usaha can insert their own data\\" ON public.telekom_data\n  FOR INSERT WITH CHECK (\n    public.has_role(auth.uid(), 'pelaku_usaha') AND auth.uid() = created_by\n  );\n\nCREATE POLICY \\"Admins can manage all telekom data\\" ON public.telekom_data\n  FOR ALL USING (\n    public.has_role(auth.uid(), 'super_admin') OR \n    public.has_role(auth.uid(), 'internal_admin') OR \n    public.has_role(auth.uid(), 'pengolah_data')\n  );\n\n-- Create function to automatically create profile on user signup\nCREATE OR REPLACE FUNCTION public.handle_new_user()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nSECURITY DEFINER SET search_path = ''\nAS $$\nBEGIN\n  INSERT INTO public.profiles (user_id, full_name)\n  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));\n  \n  -- Set default role based on signup context\n  INSERT INTO public.user_roles (user_id, role)\n  VALUES (NEW.id, 'guest');\n  \n  RETURN NEW;\nEND;\n$$;\n\n-- Create trigger for new user signup\nCREATE TRIGGER on_auth_user_created\n  AFTER INSERT ON auth.users\n  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();\n\n-- Create function to update timestamps\nCREATE OR REPLACE FUNCTION public.update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.updated_at = now();\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Create triggers for timestamp updates\nCREATE TRIGGER update_profiles_updated_at\n  BEFORE UPDATE ON public.profiles\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_faqs_updated_at\n  BEFORE UPDATE ON public.faqs\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_tickets_updated_at\n  BEFORE UPDATE ON public.tickets\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_telekom_data_updated_at\n  BEFORE UPDATE ON public.telekom_data\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\n-- Insert default FAQ categories\nINSERT INTO public.faq_categories (name, description) VALUES\n  ('Umum', 'Pertanyaan umum seputar layanan'),\n  ('Teknis', 'Pertanyaan teknis dan troubleshooting'),\n  ('Administrasi', 'Pertanyaan seputar administrasi dan dokumentasi'),\n  ('Perizinan', 'Pertanyaan seputar perizinan telekomunikasi');\n\n-- Create storage bucket for file uploads\nINSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);\n\n-- Create storage policies for document uploads\nCREATE POLICY \\"Authenticated users can upload documents\\" ON storage.objects\n  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);\n\nCREATE POLICY \\"Users can view their own documents\\" ON storage.objects\n  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);\n\nCREATE POLICY \\"Admins can view all documents\\" ON storage.objects\n  FOR SELECT USING (\n    bucket_id = 'documents' AND (\n      public.has_role(auth.uid(), 'super_admin') OR \n      public.has_role(auth.uid(), 'internal_admin')\n    )\n  );"}		sarangrumah.dev@gmail.com	\N
20250804051504	{"-- Fix function search path for handle_new_user function\nCREATE OR REPLACE FUNCTION public.handle_new_user()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nSECURITY DEFINER \nSET search_path = public\nAS $$\nBEGIN\n  INSERT INTO public.profiles (user_id, full_name)\n  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));\n  \n  -- Set default role based on signup context\n  INSERT INTO public.user_roles (user_id, role)\n  VALUES (NEW.id, 'guest');\n  \n  RETURN NEW;\nEND;\n$$;\n\n-- Fix function search path for update_updated_at_column function\nCREATE OR REPLACE FUNCTION public.update_updated_at_column()\nRETURNS TRIGGER \nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  NEW.updated_at = now();\n  RETURN NEW;\nEND;\n$$;"}		sarangrumah.dev@gmail.com	\N
20250804104001	{"-- Add file_url column to telekom_data table\nALTER TABLE public.telekom_data \nADD COLUMN file_url TEXT;\n\n-- Create storage policies for telekom data files\nCREATE POLICY \\"Users can upload their own telekom files\\" \nON storage.objects \nFOR INSERT \nWITH CHECK (\n  bucket_id = 'documents' \n  AND auth.uid()::text = (storage.foldername(name))[1]\n  AND (storage.foldername(name))[2] = 'telekom-data'\n);\n\nCREATE POLICY \\"Users can view their own telekom files\\" \nON storage.objects \nFOR SELECT \nUSING (\n  bucket_id = 'documents' \n  AND auth.uid()::text = (storage.foldername(name))[1]\n  AND (storage.foldername(name))[2] = 'telekom-data'\n);\n\nCREATE POLICY \\"Admins can view all telekom files\\" \nON storage.objects \nFOR SELECT \nUSING (\n  bucket_id = 'documents' \n  AND (storage.foldername(name))[2] = 'telekom-data'\n  AND (\n    has_role(auth.uid(), 'super_admin'::app_role) OR \n    has_role(auth.uid(), 'internal_admin'::app_role) OR \n    has_role(auth.uid(), 'pengolah_data'::app_role)\n  )\n);\n\nCREATE POLICY \\"Users can delete their own telekom files\\" \nON storage.objects \nFOR DELETE \nUSING (\n  bucket_id = 'documents' \n  AND auth.uid()::text = (storage.foldername(name))[1]\n  AND (storage.foldername(name))[2] = 'telekom-data'\n);"}		sarangrumah.dev@gmail.com	\N
20250804104711	{"-- Update documents bucket to only allow PDF files with 10MB limit\nUPDATE storage.buckets \nSET \n  allowed_mime_types = ARRAY['application/pdf'],\n  file_size_limit = 10485760\nWHERE id = 'documents';"}		sarangrumah.dev@gmail.com	\N
20250804110335	{"-- Update the documents bucket to be public to allow direct URL access\nUPDATE storage.buckets \nSET public = true \nWHERE id = 'documents';\n\n-- Create RLS policies for the documents bucket to ensure proper access control\nCREATE POLICY \\"Users can view documents they have access to\\" \nON storage.objects \nFOR SELECT \nUSING (\n  bucket_id = 'documents' AND \n  (\n    -- Allow access if user has admin roles\n    (auth.uid() IS NOT NULL AND (\n      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data'))\n    )) OR\n    -- Allow access if user is validated and can see telekom data\n    (auth.uid() IS NOT NULL AND \n     EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_validated = true))\n  )\n);\n\nCREATE POLICY \\"Users can upload documents\\" \nON storage.objects \nFOR INSERT \nWITH CHECK (\n  bucket_id = 'documents' AND \n  auth.uid() IS NOT NULL AND\n  (\n    -- Allow upload if user has admin roles or pelaku_usaha role\n    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data', 'pelaku_usaha'))\n  )\n);\n\nCREATE POLICY \\"Users can update their own documents\\" \nON storage.objects \nFOR UPDATE \nUSING (\n  bucket_id = 'documents' AND \n  auth.uid() IS NOT NULL AND\n  (\n    -- Allow update if user has admin roles\n    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data')) OR\n    -- Allow update if user owns the document (check owner field if it exists)\n    owner = auth.uid()\n  )\n);\n\nCREATE POLICY \\"Users can delete documents they own or admins can delete any\\" \nON storage.objects \nFOR DELETE \nUSING (\n  bucket_id = 'documents' AND \n  auth.uid() IS NOT NULL AND\n  (\n    -- Allow delete if user has admin roles\n    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data')) OR\n    -- Allow delete if user owns the document\n    owner = auth.uid()\n  )\n);"}		sarangrumah.dev@gmail.com	\N
20250804111811	{"-- Add file_url column to tickets table to support PDF uploads\nALTER TABLE public.tickets \nADD COLUMN file_url TEXT;"}		sarangrumah.dev@gmail.com	\N
20250804113809	{"-- Create ticket_messages table for conversation between admin and visitors\nCREATE TABLE public.ticket_messages (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,\n  user_id UUID NOT NULL,\n  message TEXT NOT NULL,\n  is_admin_message BOOLEAN NOT NULL DEFAULT false,\n  file_url TEXT,\n  is_read BOOLEAN NOT NULL DEFAULT false,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Enable Row Level Security\nALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;\n\n-- Create policies for ticket messages\nCREATE POLICY \\"Users can view messages for their own tickets\\" \nON public.ticket_messages \nFOR SELECT \nUSING (\n  EXISTS (\n    SELECT 1 FROM public.tickets \n    WHERE tickets.id = ticket_messages.ticket_id \n    AND tickets.user_id = auth.uid()\n  )\n);\n\nCREATE POLICY \\"Users can create messages for their own tickets\\" \nON public.ticket_messages \nFOR INSERT \nWITH CHECK (\n  EXISTS (\n    SELECT 1 FROM public.tickets \n    WHERE tickets.id = ticket_messages.ticket_id \n    AND tickets.user_id = auth.uid()\n  ) AND user_id = auth.uid()\n);\n\nCREATE POLICY \\"Admins can view all ticket messages\\" \nON public.ticket_messages \nFOR SELECT \nUSING (\n  has_role(auth.uid(), 'super_admin'::app_role) OR \n  has_role(auth.uid(), 'internal_admin'::app_role) OR \n  has_role(auth.uid(), 'pengolah_data'::app_role)\n);\n\nCREATE POLICY \\"Admins can create messages on any ticket\\" \nON public.ticket_messages \nFOR INSERT \nWITH CHECK (\n  (has_role(auth.uid(), 'super_admin'::app_role) OR \n   has_role(auth.uid(), 'internal_admin'::app_role) OR \n   has_role(auth.uid(), 'pengolah_data'::app_role)) AND \n  user_id = auth.uid()\n);\n\nCREATE POLICY \\"Admins can update ticket messages\\" \nON public.ticket_messages \nFOR UPDATE \nUSING (\n  has_role(auth.uid(), 'super_admin'::app_role) OR \n  has_role(auth.uid(), 'internal_admin'::app_role) OR \n  has_role(auth.uid(), 'pengolah_data'::app_role)\n);\n\n-- Create trigger for automatic timestamp updates\nCREATE TRIGGER update_ticket_messages_updated_at\nBEFORE UPDATE ON public.ticket_messages\nFOR EACH ROW\nEXECUTE FUNCTION public.update_updated_at_column();\n\n-- Create indexes for better performance\nCREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);\nCREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages(created_at DESC);"}		sarangrumah.dev@gmail.com	\N
20250805123627	{"-- Create ticket categories enum\nCREATE TYPE ticket_category AS ENUM ('technical', 'billing', 'general', 'data_request', 'account', 'other');\n\n-- Create ticket assignment status enum  \nCREATE TYPE assignment_status AS ENUM ('unassigned', 'assigned', 'in_review', 'escalated');\n\n-- Add new columns to tickets table\nALTER TABLE public.tickets \nADD COLUMN category ticket_category DEFAULT 'general',\nADD COLUMN assigned_to uuid REFERENCES auth.users(id),\nADD COLUMN assignment_status assignment_status DEFAULT 'unassigned',\nADD COLUMN first_response_at TIMESTAMP WITH TIME ZONE,\nADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,\nADD COLUMN escalated_at TIMESTAMP WITH TIME ZONE,\nADD COLUMN escalation_level INTEGER DEFAULT 0,\nADD COLUMN due_date TIMESTAMP WITH TIME ZONE,\nADD COLUMN tags TEXT[],\nADD COLUMN internal_notes TEXT;\n\n-- Create ticket_assignments table for tracking assignment history\nCREATE TABLE public.ticket_assignments (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,\n  assigned_by UUID NOT NULL REFERENCES auth.users(id),\n  assigned_to UUID NOT NULL REFERENCES auth.users(id),\n  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  unassigned_at TIMESTAMP WITH TIME ZONE,\n  notes TEXT,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create ticket_sla_metrics table for SLA tracking\nCREATE TABLE public.ticket_sla_metrics (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,\n  first_response_time_minutes INTEGER,\n  resolution_time_minutes INTEGER,\n  sla_target_response_minutes INTEGER DEFAULT 240, -- 4 hours default\n  sla_target_resolution_minutes INTEGER DEFAULT 1440, -- 24 hours default\n  response_sla_met BOOLEAN,\n  resolution_sla_met BOOLEAN,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Enable RLS on new tables\nALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.ticket_sla_metrics ENABLE ROW LEVEL SECURITY;\n\n-- RLS policies for ticket_assignments\nCREATE POLICY \\"Admins can view all ticket assignments\\" \nON public.ticket_assignments \nFOR SELECT \nUSING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));\n\nCREATE POLICY \\"Admins can manage ticket assignments\\" \nON public.ticket_assignments \nFOR ALL \nUSING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));\n\n-- RLS policies for ticket_sla_metrics\nCREATE POLICY \\"Admins can view all SLA metrics\\" \nON public.ticket_sla_metrics \nFOR SELECT \nUSING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));\n\nCREATE POLICY \\"Admins can manage SLA metrics\\" \nON public.ticket_sla_metrics \nFOR ALL \nUSING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));\n\n-- Function to automatically calculate SLA metrics\nCREATE OR REPLACE FUNCTION public.calculate_sla_metrics()\nRETURNS TRIGGER AS $$\nDECLARE\n  ticket_created_at TIMESTAMP WITH TIME ZONE;\n  first_admin_response TIMESTAMP WITH TIME ZONE;\n  ticket_resolved_at TIMESTAMP WITH TIME ZONE;\n  response_time_minutes INTEGER;\n  resolution_time_minutes INTEGER;\n  sla_response_target INTEGER := 240; -- 4 hours\n  sla_resolution_target INTEGER := 1440; -- 24 hours\nBEGIN\n  -- Get ticket creation time\n  SELECT created_at INTO ticket_created_at \n  FROM public.tickets \n  WHERE id = NEW.ticket_id;\n  \n  -- Get first admin response time\n  SELECT MIN(created_at) INTO first_admin_response\n  FROM public.ticket_messages \n  WHERE ticket_id = NEW.ticket_id AND is_admin_message = true;\n  \n  -- Get resolution time if ticket is resolved\n  SELECT resolved_at INTO ticket_resolved_at\n  FROM public.tickets \n  WHERE id = NEW.ticket_id AND status IN ('resolved', 'closed');\n  \n  -- Calculate response time in minutes\n  IF first_admin_response IS NOT NULL THEN\n    response_time_minutes := EXTRACT(EPOCH FROM (first_admin_response - ticket_created_at)) / 60;\n  END IF;\n  \n  -- Calculate resolution time in minutes\n  IF ticket_resolved_at IS NOT NULL THEN\n    resolution_time_minutes := EXTRACT(EPOCH FROM (ticket_resolved_at - ticket_created_at)) / 60;\n  END IF;\n  \n  -- Adjust SLA targets based on priority\n  SELECT CASE \n    WHEN priority = 'high' THEN 120    -- 2 hours for high priority\n    WHEN priority = 'medium' THEN 240  -- 4 hours for medium priority\n    WHEN priority = 'low' THEN 480     -- 8 hours for low priority\n    ELSE 240\n  END INTO sla_response_target\n  FROM public.tickets WHERE id = NEW.ticket_id;\n  \n  SELECT CASE \n    WHEN priority = 'high' THEN 720    -- 12 hours for high priority\n    WHEN priority = 'medium' THEN 1440 -- 24 hours for medium priority\n    WHEN priority = 'low' THEN 2880    -- 48 hours for low priority\n    ELSE 1440\n  END INTO sla_resolution_target\n  FROM public.tickets WHERE id = NEW.ticket_id;\n  \n  -- Insert or update SLA metrics\n  INSERT INTO public.ticket_sla_metrics (\n    ticket_id,\n    first_response_time_minutes,\n    resolution_time_minutes,\n    sla_target_response_minutes,\n    sla_target_resolution_minutes,\n    response_sla_met,\n    resolution_sla_met\n  ) VALUES (\n    NEW.ticket_id,\n    response_time_minutes,\n    resolution_time_minutes,\n    sla_response_target,\n    sla_resolution_target,\n    CASE WHEN response_time_minutes IS NULL THEN NULL \n         ELSE response_time_minutes <= sla_response_target END,\n    CASE WHEN resolution_time_minutes IS NULL THEN NULL \n         ELSE resolution_time_minutes <= sla_resolution_target END\n  )\n  ON CONFLICT (ticket_id) DO UPDATE SET\n    first_response_time_minutes = EXCLUDED.first_response_time_minutes,\n    resolution_time_minutes = EXCLUDED.resolution_time_minutes,\n    sla_target_response_minutes = EXCLUDED.sla_target_response_minutes,\n    sla_target_resolution_minutes = EXCLUDED.sla_target_resolution_minutes,\n    response_sla_met = EXCLUDED.response_sla_met,\n    resolution_sla_met = EXCLUDED.resolution_sla_met,\n    updated_at = now();\n    \n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Trigger to update SLA metrics when messages are added\nCREATE TRIGGER update_sla_metrics_on_message\n  AFTER INSERT ON public.ticket_messages\n  FOR EACH ROW\n  EXECUTE FUNCTION public.calculate_sla_metrics();\n\n-- Trigger to update SLA metrics when ticket status changes\nCREATE TRIGGER update_sla_metrics_on_status_change\n  AFTER UPDATE OF status ON public.tickets\n  FOR EACH ROW\n  EXECUTE FUNCTION public.calculate_sla_metrics();\n\n-- Function for automatic priority escalation\nCREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()\nRETURNS void AS $$\nBEGIN\n  -- Escalate tickets that haven't received first response within SLA\n  UPDATE public.tickets \n  SET \n    priority = CASE \n      WHEN priority = 'low' THEN 'medium'\n      WHEN priority = 'medium' THEN 'high'\n      ELSE priority\n    END,\n    escalation_level = escalation_level + 1,\n    escalated_at = now()\n  WHERE \n    status NOT IN ('resolved', 'closed')\n    AND created_at < now() - INTERVAL '4 hours'\n    AND NOT EXISTS (\n      SELECT 1 FROM public.ticket_messages \n      WHERE ticket_id = tickets.id AND is_admin_message = true\n    );\n    \n  -- Escalate high priority tickets that are still open after 8 hours\n  UPDATE public.tickets \n  SET \n    escalation_level = escalation_level + 1,\n    escalated_at = now()\n  WHERE \n    priority = 'high'\n    AND status NOT IN ('resolved', 'closed')\n    AND created_at < now() - INTERVAL '8 hours'\n    AND escalation_level = 0;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Add constraint to ensure ticket_sla_metrics has unique ticket_id\nALTER TABLE public.ticket_sla_metrics \nADD CONSTRAINT unique_ticket_sla_metrics UNIQUE (ticket_id);"}		sarangrumah.dev@gmail.com	\N
20250805123757	{"-- Fix security issues by setting search_path for functions\n\n-- Update calculate_sla_metrics function with secure search_path\nCREATE OR REPLACE FUNCTION public.calculate_sla_metrics()\nRETURNS TRIGGER \nSECURITY DEFINER\nSET search_path = 'public'\nLANGUAGE plpgsql AS $$\nDECLARE\n  ticket_created_at TIMESTAMP WITH TIME ZONE;\n  first_admin_response TIMESTAMP WITH TIME ZONE;\n  ticket_resolved_at TIMESTAMP WITH TIME ZONE;\n  response_time_minutes INTEGER;\n  resolution_time_minutes INTEGER;\n  sla_response_target INTEGER := 240; -- 4 hours\n  sla_resolution_target INTEGER := 1440; -- 24 hours\nBEGIN\n  -- Get ticket creation time\n  SELECT created_at INTO ticket_created_at \n  FROM public.tickets \n  WHERE id = NEW.ticket_id;\n  \n  -- Get first admin response time\n  SELECT MIN(created_at) INTO first_admin_response\n  FROM public.ticket_messages \n  WHERE ticket_id = NEW.ticket_id AND is_admin_message = true;\n  \n  -- Get resolution time if ticket is resolved\n  SELECT resolved_at INTO ticket_resolved_at\n  FROM public.tickets \n  WHERE id = NEW.ticket_id AND status IN ('resolved', 'closed');\n  \n  -- Calculate response time in minutes\n  IF first_admin_response IS NOT NULL THEN\n    response_time_minutes := EXTRACT(EPOCH FROM (first_admin_response - ticket_created_at)) / 60;\n  END IF;\n  \n  -- Calculate resolution time in minutes\n  IF ticket_resolved_at IS NOT NULL THEN\n    resolution_time_minutes := EXTRACT(EPOCH FROM (ticket_resolved_at - ticket_created_at)) / 60;\n  END IF;\n  \n  -- Adjust SLA targets based on priority\n  SELECT CASE \n    WHEN priority = 'high' THEN 120    -- 2 hours for high priority\n    WHEN priority = 'medium' THEN 240  -- 4 hours for medium priority\n    WHEN priority = 'low' THEN 480     -- 8 hours for low priority\n    ELSE 240\n  END INTO sla_response_target\n  FROM public.tickets WHERE id = NEW.ticket_id;\n  \n  SELECT CASE \n    WHEN priority = 'high' THEN 720    -- 12 hours for high priority\n    WHEN priority = 'medium' THEN 1440 -- 24 hours for medium priority\n    WHEN priority = 'low' THEN 2880    -- 48 hours for low priority\n    ELSE 1440\n  END INTO sla_resolution_target\n  FROM public.tickets WHERE id = NEW.ticket_id;\n  \n  -- Insert or update SLA metrics\n  INSERT INTO public.ticket_sla_metrics (\n    ticket_id,\n    first_response_time_minutes,\n    resolution_time_minutes,\n    sla_target_response_minutes,\n    sla_target_resolution_minutes,\n    response_sla_met,\n    resolution_sla_met\n  ) VALUES (\n    NEW.ticket_id,\n    response_time_minutes,\n    resolution_time_minutes,\n    sla_response_target,\n    sla_resolution_target,\n    CASE WHEN response_time_minutes IS NULL THEN NULL \n         ELSE response_time_minutes <= sla_response_target END,\n    CASE WHEN resolution_time_minutes IS NULL THEN NULL \n         ELSE resolution_time_minutes <= sla_resolution_target END\n  )\n  ON CONFLICT (ticket_id) DO UPDATE SET\n    first_response_time_minutes = EXCLUDED.first_response_time_minutes,\n    resolution_time_minutes = EXCLUDED.resolution_time_minutes,\n    sla_target_response_minutes = EXCLUDED.sla_target_response_minutes,\n    sla_target_resolution_minutes = EXCLUDED.sla_target_resolution_minutes,\n    response_sla_met = EXCLUDED.response_sla_met,\n    resolution_sla_met = EXCLUDED.resolution_sla_met,\n    updated_at = now();\n    \n  RETURN NEW;\nEND;\n$$;\n\n-- Update escalate_overdue_tickets function with secure search_path\nCREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()\nRETURNS void \nSECURITY DEFINER\nSET search_path = 'public'\nLANGUAGE plpgsql AS $$\nBEGIN\n  -- Escalate tickets that haven't received first response within SLA\n  UPDATE public.tickets \n  SET \n    priority = CASE \n      WHEN priority = 'low' THEN 'medium'\n      WHEN priority = 'medium' THEN 'high'\n      ELSE priority\n    END,\n    escalation_level = escalation_level + 1,\n    escalated_at = now()\n  WHERE \n    status NOT IN ('resolved', 'closed')\n    AND created_at < now() - INTERVAL '4 hours'\n    AND NOT EXISTS (\n      SELECT 1 FROM public.ticket_messages \n      WHERE ticket_id = tickets.id AND is_admin_message = true\n    );\n    \n  -- Escalate high priority tickets that are still open after 8 hours\n  UPDATE public.tickets \n  SET \n    escalation_level = escalation_level + 1,\n    escalated_at = now()\n  WHERE \n    priority = 'high'\n    AND status NOT IN ('resolved', 'closed')\n    AND created_at < now() - INTERVAL '8 hours'\n    AND escalation_level = 0;\nEND;\n$$;"}		sarangrumah.dev@gmail.com	\N
20250805104253	{"-- Insert sample telecommunications data for testing the map with correct enum and status values\nINSERT INTO public.telekom_data (company_name, service_type, status, region, latitude, longitude, license_date, license_number) VALUES\n('Telkomsel Jakarta', 'telekomunikasi_khusus', 'active', 'Jakarta', -6.2088, 106.8456, '2023-01-15', 'TLK-2023-001'),\n('Indosat Ooredoo Surabaya', 'telekomunikasi_khusus', 'active', 'Surabaya', -7.2575, 112.7521, '2023-02-10', 'IDO-2023-002'),\n('XL Axiata Bandung', 'telekomunikasi_khusus', 'active', 'Bandung', -6.9175, 107.6191, '2023-03-05', 'XLA-2023-003'),\n('Biznet Networks', 'jasa', 'active', 'Jakarta', -6.1751, 106.8650, '2023-01-20', 'BIZ-2023-004'),\n('CBN Fiber', 'jaringan', 'active', 'Jakarta', -6.2297, 106.8261, '2023-02-15', 'CBN-2023-005'),\n('Telkom Indonesia', 'jaringan', 'active', 'Yogyakarta', -7.7956, 110.3695, '2023-03-01', 'TLK-2023-006'),\n('First Media', 'jasa', 'active', 'Tangerang', -6.1783, 106.6319, '2023-01-25', 'FMD-2023-007'),\n('Smartfren', 'telekomunikasi_khusus', 'active', 'Medan', 3.5952, 98.6722, '2023-02-20', 'SMF-2023-008'),\n('Pasifik Satelit Nusantara', 'isr', 'active', 'Makassar', -5.1477, 119.4327, '2023-03-10', 'PSN-2023-009'),\n('Hughes Network Systems', 'isr', 'suspended', 'Denpasar', -8.6705, 115.2126, '2023-03-15', 'HNS-2023-010'),\n('Moratelindo', 'jasa', 'active', 'Semarang', -6.9667, 110.4167, '2023-02-25', 'MTI-2023-011'),\n('Icon Plus', 'jasa', 'inactive', 'Palembang', -2.9761, 104.7754, '2023-01-30', 'ICP-2023-012');"}		sarangrumah.dev@gmail.com	\N
20250805105711	{"-- Add sub_service_type column to telekom_data table\nALTER TABLE public.telekom_data \nADD COLUMN sub_service_type TEXT;\n\n-- Create index for better performance on sub_service_type filtering\nCREATE INDEX idx_telekom_data_sub_service_type ON public.telekom_data(sub_service_type);\n\n-- Update existing data with appropriate sub-service types based on the provided mapping\nUPDATE public.telekom_data \nSET sub_service_type = \n  CASE \n    WHEN service_type = 'jasa' THEN 'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)'\n    WHEN service_type = 'jaringan' THEN 'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik'\n    WHEN service_type = 'telekomunikasi_khusus' THEN 'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri'\n    WHEN service_type = 'isr' THEN 'Izin Stasiun Radio'\n    WHEN service_type = 'tarif' THEN 'Persetujuan Tarif'\n    WHEN service_type = 'sklo' THEN 'Sertifikat Kelaikan Operasi'\n    WHEN service_type = 'lko' THEN 'Sertifikat Laik Operasi'\n    ELSE 'Layanan Lainnya'\n  END\nWHERE sub_service_type IS NULL;"}		sarangrumah.dev@gmail.com	\N
20250805110242	{"-- Update sample data with proper sub-service types based on main service types\nUPDATE public.telekom_data \nSET sub_service_type = \n  CASE \n    WHEN service_type = 'jasa' AND company_name LIKE '%Biznet%' THEN 'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)'\n    WHEN service_type = 'jasa' AND company_name LIKE '%First Media%' THEN 'Izin Penyelenggaraan Jasa Televisi Protokol Internet (Internet Protocol Television/IPTV)'\n    WHEN service_type = 'jasa' AND company_name LIKE '%Moratelindo%' THEN 'Izin Penyelenggaraan Jasa Sistem Komunikasi Data'\n    WHEN service_type = 'jasa' AND company_name LIKE '%Icon Plus%' THEN 'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)'\n    \n    WHEN service_type = 'jaringan' AND company_name LIKE '%CBN%' THEN 'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik'\n    WHEN service_type = 'jaringan' AND company_name LIKE '%Telkom%' THEN 'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Circuit Switched melalui Media Fiber Optik'\n    \n    WHEN service_type = 'telekomunikasi_khusus' THEN 'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri'\n    \n    WHEN service_type = 'isr' THEN 'Izin Stasiun Radio'\n    \n    ELSE sub_service_type -- Keep existing values for other types\n  END\nWHERE sub_service_type IS NULL OR sub_service_type IN (\n  'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',\n  'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik',\n  'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri',\n  'Izin Stasiun Radio',\n  'Persetujuan Tarif',\n  'Sertifikat Kelaikan Operasi',\n  'Sertifikat Laik Operasi',\n  'Layanan Lainnya'\n);"}		sarangrumah.dev@gmail.com	\N
20250805111902	{"-- Create services table for main service categories\nCREATE TABLE public.services (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  code TEXT NOT NULL UNIQUE,\n  description TEXT,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create sub_services table for detailed service types\nCREATE TABLE public.sub_services (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL,\n  description TEXT,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  UNIQUE(service_id, code)\n);\n\n-- Enable RLS\nALTER TABLE public.services ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;\n\n-- Create policies for services\nCREATE POLICY \\"Anyone can view services\\" \nON public.services \nFOR SELECT \nUSING (true);\n\nCREATE POLICY \\"Admins can manage services\\" \nON public.services \nFOR ALL \nUSING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\n-- Create policies for sub_services\nCREATE POLICY \\"Anyone can view sub_services\\" \nON public.sub_services \nFOR SELECT \nUSING (true);\n\nCREATE POLICY \\"Admins can manage sub_services\\" \nON public.sub_services \nFOR ALL \nUSING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\n-- Insert main services\nINSERT INTO public.services (name, code, description) VALUES\n('Jasa Telekomunikasi', 'jasa', 'Layanan jasa telekomunikasi'),\n('Jaringan Telekomunikasi', 'jaringan', 'Infrastruktur jaringan telekomunikasi'),\n('Telekomunikasi Khusus', 'telekomunikasi_khusus', 'Layanan telekomunikasi untuk keperluan khusus'),\n('ISR', 'isr', 'ISR Services');\n\n-- Insert sub_services for jasa\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Jasa Internet', 'PENYELENGGARAAN_JASA_INTERNET'\nFROM public.services s WHERE s.code = 'jasa';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Jasa Akses Internet', 'JASA_AKSES_INTERNET'\nFROM public.services s WHERE s.code = 'jasa';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Jasa Teleponi Dasar', 'JASA_TELEPONI_DASAR'\nFROM public.services s WHERE s.code = 'jasa';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Multimedia', 'MULTIMEDIA'\nFROM public.services s WHERE s.code = 'jasa';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Jasa Teleponi Bergerak Selular', 'JASA_TELEPONI_BERGERAK_SELULAR'\nFROM public.services s WHERE s.code = 'jasa';\n\n-- Insert sub_services for jaringan\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Jaringan Tetap Tertutup', 'PENYELENGGARAAN_JARINGAN_TETAP_TERTUTUP'\nFROM public.services s WHERE s.code = 'jaringan';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Jaringan Bergerak Selular', 'PENYELENGGARAAN_JARINGAN_BERGERAK_SELULAR'\nFROM public.services s WHERE s.code = 'jaringan';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Jaringan Tetap Lokal', 'PENYELENGGARAAN_JARINGAN_TETAP_LOKAL'\nFROM public.services s WHERE s.code = 'jaringan';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Jaringan Tetap Sambungan Langsung Jarak Jauh', 'PENYELENGGARAAN_JARINGAN_TETAP_SAMBUNGAN_LANGSUNG_JARAK_JAUH'\nFROM public.services s WHERE s.code = 'jaringan';\n\n-- Insert sub_services for telekomunikasi_khusus\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Very Small Aperture Terminal (VSAT)', 'VERY_SMALL_APERTURE_TERMINAL_VSAT'\nFROM public.services s WHERE s.code = 'telekomunikasi_khusus';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Pertelevisian', 'PENYELENGGARAAN_TELEKOMUNIKASI_KHUSUS_UNTUK_KEPERLUAN_PERTELEVISIAN'\nFROM public.services s WHERE s.code = 'telekomunikasi_khusus';\n\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'Penyelenggaraan Telekomunikasi Khusus Lainnya', 'PENYELENGGARAAN_TELEKOMUNIKASI_KHUSUS_LAINNYA'\nFROM public.services s WHERE s.code = 'telekomunikasi_khusus';\n\n-- Insert sub_services for isr\nINSERT INTO public.sub_services (service_id, name, code) \nSELECT s.id, 'ISR Service', 'ISR_SERVICE'\nFROM public.services s WHERE s.code = 'isr';\n\n-- Add sub_service_id column to telekom_data\nALTER TABLE public.telekom_data ADD COLUMN sub_service_id UUID REFERENCES public.sub_services(id);\n\n-- Migrate existing data from text-based service types to UUID references\nUPDATE public.telekom_data td\nSET sub_service_id = ss.id\nFROM public.sub_services ss\nJOIN public.services s ON ss.service_id = s.id\nWHERE s.code = td.service_type::text\nAND ss.name = COALESCE(td.sub_service_type, \n  CASE \n    WHEN td.service_type::text = 'jasa' THEN 'Jasa Akses Internet'\n    WHEN td.service_type::text = 'jaringan' THEN 'Penyelenggaraan Jaringan Tetap Lokal'\n    WHEN td.service_type::text = 'telekomunikasi_khusus' THEN 'Very Small Aperture Terminal (VSAT)'\n    WHEN td.service_type::text = 'isr' THEN 'ISR Service'\n  END\n);\n\n-- Create indexes for better performance\nCREATE INDEX idx_sub_services_service_id ON public.sub_services(service_id);\nCREATE INDEX idx_telekom_data_sub_service_id ON public.telekom_data(sub_service_id);\n\n-- Create trigger for updating timestamps\nCREATE TRIGGER update_services_updated_at\nBEFORE UPDATE ON public.services\nFOR EACH ROW\nEXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_sub_services_updated_at\nBEFORE UPDATE ON public.sub_services\nFOR EACH ROW\nEXECUTE FUNCTION public.update_updated_at_column();"}		sarangrumah.dev@gmail.com	\N
20250805120031	{"-- Create provinces table for Indonesian administrative divisions\nCREATE TABLE public.provinces (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  code TEXT NOT NULL UNIQUE,\n  name TEXT NOT NULL,\n  latitude NUMERIC,\n  longitude NUMERIC,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Create kabupaten table for Indonesian cities/regencies\nCREATE TABLE public.kabupaten (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  province_id UUID NOT NULL REFERENCES provinces(id),\n  code TEXT NOT NULL UNIQUE,\n  name TEXT NOT NULL,\n  type TEXT NOT NULL CHECK (type IN ('kabupaten', 'kota')),\n  latitude NUMERIC NOT NULL,\n  longitude NUMERIC NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Enable RLS on provinces table\nALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;\n\n-- Create policies for provinces (public read access)\nCREATE POLICY \\"Anyone can view provinces\\" \nON public.provinces \nFOR SELECT \nUSING (true);\n\nCREATE POLICY \\"Admins can manage provinces\\" \nON public.provinces \nFOR ALL \nUSING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\n-- Enable RLS on kabupaten table\nALTER TABLE public.kabupaten ENABLE ROW LEVEL SECURITY;\n\n-- Create policies for kabupaten (public read access)\nCREATE POLICY \\"Anyone can view kabupaten\\" \nON public.kabupaten \nFOR SELECT \nUSING (true);\n\nCREATE POLICY \\"Admins can manage kabupaten\\" \nON public.kabupaten \nFOR ALL \nUSING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\n-- Add province_id and kabupaten_id to telekom_data table\nALTER TABLE public.telekom_data \nADD COLUMN province_id UUID REFERENCES provinces(id),\nADD COLUMN kabupaten_id UUID REFERENCES kabupaten(id);\n\n-- Create indexes for better performance\nCREATE INDEX idx_kabupaten_province_id ON public.kabupaten(province_id);\nCREATE INDEX idx_telekom_data_province_id ON public.telekom_data(province_id);\nCREATE INDEX idx_telekom_data_kabupaten_id ON public.telekom_data(kabupaten_id);\n\n-- Create triggers for updated_at columns\nCREATE TRIGGER update_provinces_updated_at\nBEFORE UPDATE ON public.provinces\nFOR EACH ROW\nEXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_kabupaten_updated_at\nBEFORE UPDATE ON public.kabupaten\nFOR EACH ROW\nEXECUTE FUNCTION public.update_updated_at_column();\n\n-- Insert Indonesian provinces with coordinates\nINSERT INTO public.provinces (code, name, latitude, longitude) VALUES\n('11', 'Aceh', 4.695135, 96.7493993),\n('12', 'Sumatera Utara', 2.1153547, 99.5450974),\n('13', 'Sumatera Barat', -0.7399397, 100.8000051),\n('14', 'Riau', 0.2933469, 101.7068294),\n('15', 'Jambi', -1.4851831, 102.4380581),\n('16', 'Sumatera Selatan', -3.3194374, 103.914399),\n('17', 'Bengkulu', -3.8004444, 102.2655435),\n('18', 'Lampung', -4.5585849, 105.4068079),\n('19', 'Kepulauan Bangka Belitung', -2.7410513, 106.4405872),\n('21', 'Kepulauan Riau', 3.9456514, 108.1428669),\n('31', 'DKI Jakarta', -6.211544, 106.845172),\n('32', 'Jawa Barat', -6.914744, 107.609344),\n('33', 'Jawa Tengah', -7.150975, 110.1402594),\n('34', 'DI Yogyakarta', -7.8753849, 110.4262088),\n('35', 'Jawa Timur', -7.5360639, 112.2384017),\n('36', 'Banten', -6.4058172, 106.0640179),\n('51', 'Bali', -8.4095178, 115.188916),\n('52', 'Nusa Tenggara Barat', -8.6529334, 117.3616476),\n('53', 'Nusa Tenggara Timur', -8.6573819, 121.0793705),\n('61', 'Kalimantan Barat', -0.2787808, 111.4752851),\n('62', 'Kalimantan Tengah', -1.6814878, 113.3823545),\n('63', 'Kalimantan Selatan', -3.0926415, 115.2837585),\n('64', 'Kalimantan Timur', 1.6406296, 116.419389),\n('65', 'Kalimantan Utara', 2.72882, 117.1397),\n('71', 'Sulawesi Utara', 1.2379274, 124.8413916),\n('72', 'Sulawesi Tengah', -1.4300254, 121.4456179),\n('73', 'Sulawesi Selatan', -3.6687994, 119.9740534),\n('74', 'Sulawesi Tenggara', -4.14491, 122.174605),\n('75', 'Gorontalo', 0.6999372, 122.4467238),\n('76', 'Sulawesi Barat', -2.8441371, 119.2320784),\n('81', 'Maluku', -3.2384616, 130.1452734),\n('82', 'Maluku Utara', 1.5709993, 127.8087693),\n('91', 'Papua Barat', -1.3361154, 133.1747162),\n('94', 'Papua', -4.269928, 138.0803529);\n\n-- Insert major kabupaten/kota with coordinates\nINSERT INTO public.kabupaten (province_id, code, name, type, latitude, longitude) VALUES\n-- DKI Jakarta\n((SELECT id FROM provinces WHERE code = '31'), '3171', 'Jakarta Selatan', 'kota', -6.2614927, 106.8105998),\n((SELECT id FROM provinces WHERE code = '31'), '3172', 'Jakarta Timur', 'kota', -6.2249396, 106.9004281),\n((SELECT id FROM provinces WHERE code = '31'), '3173', 'Jakarta Pusat', 'kota', -6.1805149, 106.8283583),\n((SELECT id FROM provinces WHERE code = '31'), '3174', 'Jakarta Barat', 'kota', -6.1352, 106.813301),\n((SELECT id FROM provinces WHERE code = '31'), '3175', 'Jakarta Utara', 'kota', -6.138414, 106.863956),\n\n-- Jawa Barat\n((SELECT id FROM provinces WHERE code = '32'), '3273', 'Bandung', 'kota', -6.9174639, 107.6191228),\n((SELECT id FROM provinces WHERE code = '32'), '3204', 'Bandung', 'kabupaten', -7.0051453, 107.5587606),\n((SELECT id FROM provinces WHERE code = '32'), '3276', 'Depok', 'kota', -6.4025124, 106.7942276),\n((SELECT id FROM provinces WHERE code = '32'), '3201', 'Bogor', 'kabupaten', -6.595038, 106.816635),\n((SELECT id FROM provinces WHERE code = '32'), '3271', 'Bogor', 'kota', -6.5971469, 106.8060388),\n\n-- Jawa Tengah  \n((SELECT id FROM provinces WHERE code = '33'), '3374', 'Semarang', 'kota', -6.9932571, 110.4203043),\n((SELECT id FROM provinces WHERE code = '33'), '3326', 'Semarang', 'kabupaten', -7.1462, 110.4985),\n((SELECT id FROM provinces WHERE code = '33'), '3372', 'Surakarta', 'kota', -7.5755049, 110.8243272),\n\n-- Jawa Timur\n((SELECT id FROM provinces WHERE code = '35'), '3578', 'Surabaya', 'kota', -7.2459717, 112.7378266),\n((SELECT id FROM provinces WHERE code = '35'), '3573', 'Malang', 'kota', -7.9666204, 112.6326321),\n((SELECT id FROM provinces WHERE code = '35'), '3563', 'Malang', 'kabupaten', -8.1844791, 112.6304102),\n\n-- Sumatera Utara\n((SELECT id FROM provinces WHERE code = '12'), '1271', 'Medan', 'kota', 3.5951956, 98.6722227),\n((SELECT id FROM provinces WHERE code = '12'), '1275', 'Binjai', 'kota', 3.6001, 98.4854),\n\n-- Sumatera Barat\n((SELECT id FROM provinces WHERE code = '13'), '1371', 'Padang', 'kota', -0.9471389, 100.4172436),\n\n-- Riau\n((SELECT id FROM provinces WHERE code = '14'), '1471', 'Pekanbaru', 'kota', 0.5070718, 101.4477932),\n\n-- Sumatera Selatan\n((SELECT id FROM provinces WHERE code = '16'), '1671', 'Palembang', 'kota', -2.9760735, 104.7754307),\n\n-- Lampung\n((SELECT id FROM provinces WHERE code = '18'), '1871', 'Bandar Lampung', 'kota', -5.3971038, 105.2668038),\n\n-- Bali\n((SELECT id FROM provinces WHERE code = '51'), '5171', 'Denpasar', 'kota', -8.6704582, 115.2126293),\n\n-- Sulawesi Selatan\n((SELECT id FROM provinces WHERE code = '73'), '7371', 'Makassar', 'kota', -5.1476651, 119.4327314),\n\n-- Kalimantan Timur\n((SELECT id FROM provinces WHERE code = '64'), '6472', 'Balikpapan', 'kota', -1.2379274, 116.8316051),\n((SELECT id FROM provinces WHERE code = '64'), '6471', 'Samarinda', 'kota', -0.4985343, 117.1436676);"}		sarangrumah.dev@gmail.com	\N
20250805121110	{"-- Add comprehensive kabupaten data for all provinces in Indonesia\n-- This includes major kabupaten and kota with accurate coordinates\n\nINSERT INTO public.kabupaten (province_id, code, name, type, latitude, longitude) VALUES\n-- Aceh (assuming existing province IDs, we'll need to match with actual province codes)\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1101', 'Simeulue', 'kabupaten', 2.6111, 96.0906),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1102', 'Aceh Singkil', 'kabupaten', 2.4200, 97.9300),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1103', 'Aceh Selatan', 'kabupaten', 3.2333, 97.4167),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1104', 'Aceh Tenggara', 'kabupaten', 3.3258, 97.7217),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1105', 'Aceh Timur', 'kabupaten', 4.6333, 97.6333),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1106', 'Aceh Tengah', 'kabupaten', 4.6272, 96.8322),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1107', 'Aceh Barat', 'kabupaten', 4.4500, 96.1667),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1108', 'Aceh Besar', 'kabupaten', 5.5000, 95.4500),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1109', 'Pidie', 'kabupaten', 5.1333, 96.1500),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1110', 'Bireuen', 'kabupaten', 5.2000, 96.7000),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1111', 'Aceh Utara', 'kabupaten', 5.1750, 97.1333),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1112', 'Aceh Barat Daya', 'kabupaten', 3.7833, 96.8667),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1113', 'Gayo Lues', 'kabupaten', 4.1833, 97.3167),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1114', 'Aceh Tamiang', 'kabupaten', 4.2500, 98.0167),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1115', 'Nagan Raya', 'kabupaten', 4.1333, 96.5500),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1116', 'Aceh Jaya', 'kabupaten', 4.7667, 95.6833),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1117', 'Bener Meriah', 'kabupaten', 4.7833, 96.8333),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1118', 'Pidie Jaya', 'kabupaten', 5.1000, 96.1833),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1171', 'Banda Aceh', 'kota', 5.5577, 95.3222),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1172', 'Sabang', 'kota', 5.8944, 95.3194),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1173', 'Langsa', 'kota', 4.4683, 97.9683),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1174', 'Lhokseumawe', 'kota', 5.1794, 97.1508),\n((SELECT id FROM provinces WHERE code = '11' LIMIT 1), '1175', 'Subulussalam', 'kota', 2.6833, 97.9333),\n\n-- Sumatera Utara\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1201', 'Nias', 'kabupaten', 1.0833, 97.5833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1202', 'Mandailing Natal', 'kabupaten', 0.7833, 99.3500),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1203', 'Tapanuli Selatan', 'kabupaten', 1.5500, 99.2667),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1204', 'Tapanuli Tengah', 'kabupaten', 1.9167, 98.6833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1205', 'Tapanuli Utara', 'kabupaten', 2.0167, 99.0667),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1206', 'Toba Samosir', 'kabupaten', 2.6500, 99.0833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1207', 'Labuhan Batu', 'kabupaten', 2.2000, 100.1167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1208', 'Asahan', 'kabupaten', 2.9833, 99.6167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1209', 'Simalungun', 'kabupaten', 3.0000, 99.0000),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1210', 'Dairi', 'kabupaten', 2.8500, 98.2167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1211', 'Karo', 'kabupaten', 3.1333, 98.5000),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1212', 'Deli Serdang', 'kabupaten', 3.4333, 98.6833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1213', 'Langkat', 'kabupaten', 3.7833, 98.0833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1214', 'Nias Selatan', 'kabupaten', 0.8000, 97.7500),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1215', 'Humbang Hasundutan', 'kabupaten', 2.2833, 98.5000),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1216', 'Pakpak Bharat', 'kabupaten', 2.6167, 98.2667),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1217', 'Samosir', 'kabupaten', 2.5833, 98.7167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1218', 'Serdang Bedagai', 'kabupaten', 3.3667, 99.1167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1219', 'Batu Bara', 'kabupaten', 3.8167, 99.4833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1220', 'Padang Lawas Utara', 'kabupaten', 1.7000, 99.8167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1221', 'Padang Lawas', 'kabupaten', 1.3833, 99.8167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1222', 'Labuhan Batu Selatan', 'kabupaten', 1.8500, 100.1833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1223', 'Labuhan Batu Utara', 'kabupaten', 2.3500, 100.0167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1224', 'Nias Utara', 'kabupaten', 1.4167, 97.5167),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1225', 'Nias Barat', 'kabupaten', 1.1333, 97.3667),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1271', 'Sibolga', 'kota', 1.7400, 98.7833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1272', 'Tanjung Balai', 'kota', 2.9667, 99.7944),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1273', 'Pematang Siantar', 'kota', 2.9500, 99.0500),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1274', 'Tebing Tinggi', 'kota', 3.3167, 99.1667),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1275', 'Medan', 'kota', 3.5952, 98.6722),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1276', 'Binjai', 'kota', 3.6000, 98.4833),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1277', 'Padangsidimpuan', 'kota', 1.3667, 99.2667),\n((SELECT id FROM provinces WHERE code = '12' LIMIT 1), '1278', 'Gunungsitoli', 'kota', 1.2833, 97.6167),\n\n-- DKI Jakarta\n((SELECT id FROM provinces WHERE code = '31' LIMIT 1), '3101', 'Kepulauan Seribu', 'kabupaten', -5.6167, 106.5167),\n((SELECT id FROM provinces WHERE code = '31' LIMIT 1), '3171', 'Jakarta Selatan', 'kota', -6.2608, 106.8106),\n((SELECT id FROM provinces WHERE code = '31' LIMIT 1), '3172', 'Jakarta Timur', 'kota', -6.2250, 106.9004),\n((SELECT id FROM provinces WHERE code = '31' LIMIT 1), '3173', 'Jakarta Pusat', 'kota', -6.1805, 106.8284),\n((SELECT id FROM provinces WHERE code = '31' LIMIT 1), '3174', 'Jakarta Barat', 'kota', -6.1352, 106.7444),\n((SELECT id FROM provinces WHERE code = '31' LIMIT 1), '3175', 'Jakarta Utara', 'kota', -6.1380, 106.8633),\n\n-- Jawa Barat (sample of major kabupaten/kota)\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3201', 'Bogor', 'kabupaten', -6.5972, 106.8061),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3202', 'Sukabumi', 'kabupaten', -6.9175, 106.9269),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3203', 'Cianjur', 'kabupaten', -6.8200, 107.1428),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3204', 'Bandung', 'kabupaten', -7.0051, 107.5619),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3205', 'Garut', 'kabupaten', -7.2134, 107.9065),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3206', 'Tasikmalaya', 'kabupaten', -7.3274, 108.2207),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3207', 'Ciamis', 'kabupaten', -7.3257, 108.3534),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3208', 'Kuningan', 'kabupaten', -6.9759, 108.4837),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3209', 'Cirebon', 'kabupaten', -6.7063, 108.5573),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3210', 'Majalengka', 'kabupaten', -6.8361, 108.2273),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3211', 'Sumedang', 'kabupaten', -6.8595, 107.9239),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3212', 'Indramayu', 'kabupaten', -6.3264, 108.3200),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3213', 'Subang', 'kabupaten', -6.5693, 107.7607),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3214', 'Purwakarta', 'kabupaten', -6.5569, 107.4431),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3215', 'Karawang', 'kabupaten', -6.3064, 107.3373),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3216', 'Bekasi', 'kabupaten', -6.2383, 107.1564),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3217', 'Bandung Barat', 'kabupaten', -6.8612, 107.4675),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3218', 'Pangandaran', 'kabupaten', -7.6851, 108.6500),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3271', 'Bogor', 'kota', -6.5950, 106.8167),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3272', 'Sukabumi', 'kota', -6.9278, 106.9361),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3273', 'Bandung', 'kota', -6.9175, 107.6191),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3274', 'Cirebon', 'kota', -6.7320, 108.5570),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3275', 'Bekasi', 'kota', -6.2441, 106.9918),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3276', 'Depok', 'kota', -6.4025, 106.7942),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3277', 'Cimahi', 'kota', -6.8721, 107.5420),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3278', 'Tasikmalaya', 'kota', -7.3506, 108.2175),\n((SELECT id FROM provinces WHERE code = '32' LIMIT 1), '3279', 'Banjar', 'kota', -7.3700, 108.5389),\n\n-- Bali\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5101', 'Jembrana', 'kabupaten', -8.2167, 114.6167),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5102', 'Tabanan', 'kabupaten', -8.5389, 115.1194),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5103', 'Badung', 'kabupaten', -8.5506, 115.1761),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5104', 'Gianyar', 'kabupaten', -8.5400, 115.3289),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5105', 'Klungkung', 'kabupaten', -8.5167, 115.4167),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5106', 'Bangli', 'kabupaten', -8.2833, 115.3500),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5107', 'Karangasem', 'kabupaten', -8.4500, 115.6167),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5108', 'Buleleng', 'kabupaten', -8.1167, 115.0833),\n((SELECT id FROM provinces WHERE code = '51' LIMIT 1), '5171', 'Denpasar', 'kota', -8.6500, 115.2167),\n\n-- Papua (sample)\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9401', 'Merauke', 'kabupaten', -8.4667, 140.4000),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9402', 'Jayawijaya', 'kabupaten', -4.0833, 138.9167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9403', 'Jayapura', 'kabupaten', -2.5333, 140.7167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9404', 'Nabire', 'kabupaten', -3.3667, 135.4833),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9405', 'Kepulauan Yapen', 'kabupaten', -1.7500, 136.0833),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9406', 'Biak Numfor', 'kabupaten', -1.1833, 136.0833),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9407', 'Paniai', 'kabupaten', -3.9167, 136.3500),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9408', 'Puncak Jaya', 'kabupaten', -4.0833, 137.1500),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9409', 'Mimika', 'kabupaten', -4.5333, 136.5500),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9410', 'Boven Digoel', 'kabupaten', -6.2167, 140.3833),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9411', 'Mappi', 'kabupaten', -7.0000, 139.4167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9412', 'Asmat', 'kabupaten', -5.5000, 138.4833),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9413', 'Yahukimo', 'kabupaten', -4.6167, 139.4167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9414', 'Pegunungan Bintang', 'kabupaten', -4.8000, 140.3167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9415', 'Tolikara', 'kabupaten', -3.5167, 138.0500),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9416', 'Sarmi', 'kabupaten', -2.3167, 138.7833),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9417', 'Keerom', 'kabupaten', -3.2833, 140.6167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9418', 'Waropen', 'kabupaten', -2.0833, 136.6333),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9419', 'Supiori', 'kabupaten', -0.7667, 135.5333),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9420', 'Mamberamo Raya', 'kabupaten', -2.3333, 138.2167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9421', 'Nduga', 'kabupaten', -4.5000, 138.2333),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9422', 'Lanny Jaya', 'kabupaten', -3.9167, 138.3167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9423', 'Mamberamo Tengah', 'kabupaten', -2.8333, 138.4000),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9424', 'Yalimo', 'kabupaten', -3.8333, 138.7167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9425', 'Puncak', 'kabupaten', -3.3500, 137.4167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9426', 'Dogiyai', 'kabupaten', -4.1000, 135.7333),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9427', 'Intan Jaya', 'kabupaten', -3.4167, 136.8167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9428', 'Deiyai', 'kabupaten', -4.2000, 136.2167),\n((SELECT id FROM provinces WHERE code = '94' LIMIT 1), '9471', 'Jayapura', 'kota', -2.5167, 140.7000)\n\nON CONFLICT (code) DO NOTHING;"}		sarangrumah.dev@gmail.com	\N
20250805051742	{"-- Create comprehensive sample telekom data for visualization with correct enum values\nINSERT INTO telekom_data (\n  company_name, \n  service_type, \n  sub_service_type, \n  license_number, \n  license_date, \n  province_id, \n  kabupaten_id, \n  status, \n  latitude, \n  longitude,\n  region\n) VALUES \n-- Jakarta sample data\n('PT Telkomsel Jakarta', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-JKT-001', '2023-01-15', \n (SELECT id FROM provinces WHERE name = 'DKI Jakarta' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Jakarta Pusat' LIMIT 1), \n 'active', -6.2088, 106.8456, 'DKI Jakarta'),\n\n('PT Indosat Jakarta', 'jasa', 'Penyelenggara Jasa Internet', 'IND-JKT-002', '2023-02-20', \n (SELECT id FROM provinces WHERE name = 'DKI Jakarta' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Jakarta Selatan' LIMIT 1), \n 'active', -6.2614, 106.8106, 'DKI Jakarta'),\n\n('PT XL Axiata Jakarta', 'jasa', 'Penyelenggara Jasa Internet', 'XL-JKT-003', '2023-03-10', \n (SELECT id FROM provinces WHERE name = 'DKI Jakarta' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Jakarta Utara' LIMIT 1), \n 'active', -6.1478, 106.8740, 'DKI Jakarta'),\n\n-- West Java sample data\n('PT Telkomsel Bandung', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-BDG-004', '2023-01-25', \n (SELECT id FROM provinces WHERE name = 'Jawa Barat' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Bandung' LIMIT 1), \n 'active', -6.9175, 107.6191, 'Jawa Barat'),\n\n('PT Indosat Bekasi', 'jasa', 'Penyelenggara Jasa Internet', 'IND-BKS-005', '2023-04-15', \n (SELECT id FROM provinces WHERE name = 'Jawa Barat' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Bekasi' LIMIT 1), \n 'active', -6.2441, 106.9991, 'Jawa Barat'),\n\n-- Central Java sample data\n('PT Smartfren Semarang', 'jasa', 'Penyelenggara Jasa Internet', 'SMT-SMG-006', '2023-02-10', \n (SELECT id FROM provinces WHERE name = 'Jawa Tengah' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Semarang' LIMIT 1), \n 'active', -6.9933, 110.4203, 'Jawa Tengah'),\n\n('PT Tri Jogja', 'jasa', 'Penyelenggara Jasa Internet', 'TRI-JOG-007', '2023-03-05', \n (SELECT id FROM provinces WHERE name = 'DI Yogyakarta' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Yogyakarta' LIMIT 1), \n 'active', -7.7956, 110.3695, 'DI Yogyakarta'),\n\n-- East Java sample data\n('PT Telkomsel Surabaya', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-SBY-008', '2023-01-30', \n (SELECT id FROM provinces WHERE name = 'Jawa Timur' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Surabaya' LIMIT 1), \n 'active', -7.2575, 112.7521, 'Jawa Timur'),\n\n('PT XL Malang', 'jasa', 'Penyelenggara Jasa Internet', 'XL-MLG-009', '2023-04-20', \n (SELECT id FROM provinces WHERE name = 'Jawa Timur' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Malang' LIMIT 1), \n 'active', -7.9797, 112.6304, 'Jawa Timur'),\n\n-- Sumatra sample data\n('PT Indosat Medan', 'jasa', 'Penyelenggara Jasa Internet', 'IND-MDN-010', '2023-02-05', \n (SELECT id FROM provinces WHERE name = 'Sumatera Utara' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Medan' LIMIT 1), \n 'active', 3.5952, 98.6722, 'Sumatera Utara'),\n\n('PT Smartfren Palembang', 'jasa', 'Penyelenggara Jasa Internet', 'SMT-PLG-011', '2023-03-15', \n (SELECT id FROM provinces WHERE name = 'Sumatera Selatan' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Palembang' LIMIT 1), \n 'active', -2.9761, 104.7754, 'Sumatera Selatan'),\n\n-- Kalimantan sample data\n('PT Tri Balikpapan', 'jasa', 'Penyelenggara Jasa Internet', 'TRI-BPP-012', '2023-01-20', \n (SELECT id FROM provinces WHERE name = 'Kalimantan Timur' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Balikpapan' LIMIT 1), \n 'active', -1.2379, 116.8529, 'Kalimantan Timur'),\n\n('PT Telkomsel Pontianak', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-PTK-013', '2023-04-10', \n (SELECT id FROM provinces WHERE name = 'Kalimantan Barat' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Pontianak' LIMIT 1), \n 'active', -0.0263, 109.3425, 'Kalimantan Barat'),\n\n-- Sulawesi sample data\n('PT XL Makassar', 'jasa', 'Penyelenggara Jasa Internet', 'XL-MKS-014', '2023-02-25', \n (SELECT id FROM provinces WHERE name = 'Sulawesi Selatan' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Makassar' LIMIT 1), \n 'active', -5.1477, 119.4327, 'Sulawesi Selatan'),\n\n('PT Indosat Manado', 'jasa', 'Penyelenggara Jasa Internet', 'IND-MND-015', '2023-03-20', \n (SELECT id FROM provinces WHERE name = 'Sulawesi Utara' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Manado' LIMIT 1), \n 'active', 1.4748, 124.8421, 'Sulawesi Utara'),\n\n-- Papua sample data\n('PT Smartfren Jayapura', 'jasa', 'Penyelenggara Jasa Internet', 'SMT-JPR-016', '2023-04-05', \n (SELECT id FROM provinces WHERE name = 'Papua' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Jayapura' LIMIT 1), \n 'active', -2.5489, 140.7077, 'Papua'),\n\n-- Bali sample data\n('PT Tri Denpasar', 'jasa', 'Penyelenggara Jasa Internet', 'TRI-DPS-017', '2023-01-10', \n (SELECT id FROM provinces WHERE name = 'Bali' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Denpasar' LIMIT 1), \n 'active', -8.6500, 115.2167, 'Bali'),\n\n-- Additional diverse service types\n('PT Network Provider Surakarta', 'jaringan', 'Penyelenggara Jaringan Tetap Tertutup', 'NET-SKR-018', '2023-02-15', \n (SELECT id FROM provinces WHERE name = 'Jawa Tengah' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Surakarta' LIMIT 1), \n 'active', -7.5755, 110.8243, 'Jawa Tengah'),\n\n('PT Telecom Infrastructure Batam', 'jaringan', 'Penyelenggara Jaringan Bergerak Seluler', 'TEL-BTM-019', '2023-03-25', \n (SELECT id FROM provinces WHERE name = 'Kepulauan Riau' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Batam' LIMIT 1), \n 'active', 1.1304, 104.0530, 'Kepulauan Riau'),\n\n('PT Digital Services Lombok', 'jasa', 'Penyelenggara Jasa Akses Internet', 'DIG-LMB-020', '2023-04-30', \n (SELECT id FROM provinces WHERE name = 'Nusa Tenggara Barat' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Mataram' LIMIT 1), \n 'active', -8.5833, 116.1167, 'Nusa Tenggara Barat'),\n\n-- More recent entries for trend analysis\n('PT Future Tech Tangerang', 'jasa', 'Penyelenggara Jasa Internet', 'FUT-TNG-021', '2024-01-15', \n (SELECT id FROM provinces WHERE name = 'Banten' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Tangerang' LIMIT 1), \n 'active', -6.1783, 106.6319, 'Banten'),\n\n('PT Innovative Comms Cirebon', 'jaringan', 'Penyelenggara Jaringan Tetap Lokal', 'INN-CRB-022', '2024-02-10', \n (SELECT id FROM provinces WHERE name = 'Jawa Barat' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Cirebon' LIMIT 1), \n 'active', -6.7063, 108.5571, 'Jawa Barat'),\n\n('PT Next Gen Networks Padang', 'jasa', 'Penyelenggara Jasa Internet', 'NGN-PDG-023', '2024-03-05', \n (SELECT id FROM provinces WHERE name = 'Sumatera Barat' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Padang' LIMIT 1), \n 'active', -0.9471, 100.4172, 'Sumatera Barat'),\n\n-- Some inactive/suspended entries for status diversity\n('PT Legacy Systems Banjarmasin', 'jasa', 'Penyelenggara Jasa Internet', 'LEG-BJM-024', '2022-12-20', \n (SELECT id FROM provinces WHERE name = 'Kalimantan Selatan' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Banjarmasin' LIMIT 1), \n 'inactive', -3.3194, 114.5906, 'Kalimantan Selatan'),\n\n('PT Temporary Service Pekanbaru', 'jaringan', 'Penyelenggara Jaringan Bergerak Seluler', 'TMP-PKU-025', '2023-06-15', \n (SELECT id FROM provinces WHERE name = 'Riau' LIMIT 1), \n (SELECT id FROM kabupaten WHERE name = 'Pekanbaru' LIMIT 1), \n 'suspended', 0.5072, 101.4478, 'Riau');"}		sarangrumah.dev@gmail.com	\N
20250805060654	{"-- Phase 1: Security Hardening - Fix function search path security\n-- Update existing functions to have proper search_path\nCREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)\n RETURNS boolean\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\n  SELECT EXISTS (\n    SELECT 1\n    FROM public.user_roles\n    WHERE user_id = _user_id AND role = _role\n  )\n$function$;\n\nCREATE OR REPLACE FUNCTION public.handle_new_user()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nBEGIN\n  INSERT INTO public.profiles (user_id, full_name)\n  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));\n  \n  -- Set default role based on signup context\n  INSERT INTO public.user_roles (user_id, role)\n  VALUES (NEW.id, 'guest');\n  \n  RETURN NEW;\nEND;\n$function$;\n\nCREATE OR REPLACE FUNCTION public.update_updated_at_column()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nBEGIN\n  NEW.updated_at = now();\n  RETURN NEW;\nEND;\n$function$;\n\nCREATE OR REPLACE FUNCTION public.calculate_sla_metrics()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nDECLARE\n  ticket_created_at TIMESTAMP WITH TIME ZONE;\n  first_admin_response TIMESTAMP WITH TIME ZONE;\n  ticket_resolved_at TIMESTAMP WITH TIME ZONE;\n  response_time_minutes INTEGER;\n  resolution_time_minutes INTEGER;\n  sla_response_target INTEGER := 240; -- 4 hours\n  sla_resolution_target INTEGER := 1440; -- 24 hours\nBEGIN\n  -- Get ticket creation time\n  SELECT created_at INTO ticket_created_at \n  FROM public.tickets \n  WHERE id = NEW.ticket_id;\n  \n  -- Get first admin response time\n  SELECT MIN(created_at) INTO first_admin_response\n  FROM public.ticket_messages \n  WHERE ticket_id = NEW.ticket_id AND is_admin_message = true;\n  \n  -- Get resolution time if ticket is resolved\n  SELECT resolved_at INTO ticket_resolved_at\n  FROM public.tickets \n  WHERE id = NEW.ticket_id AND status IN ('resolved', 'closed');\n  \n  -- Calculate response time in minutes\n  IF first_admin_response IS NOT NULL THEN\n    response_time_minutes := EXTRACT(EPOCH FROM (first_admin_response - ticket_created_at)) / 60;\n  END IF;\n  \n  -- Calculate resolution time in minutes\n  IF ticket_resolved_at IS NOT NULL THEN\n    resolution_time_minutes := EXTRACT(EPOCH FROM (ticket_resolved_at - ticket_created_at)) / 60;\n  END IF;\n  \n  -- Adjust SLA targets based on priority\n  SELECT CASE \n    WHEN priority = 'high' THEN 120    -- 2 hours for high priority\n    WHEN priority = 'medium' THEN 240  -- 4 hours for medium priority\n    WHEN priority = 'low' THEN 480     -- 8 hours for low priority\n    ELSE 240\n  END INTO sla_response_target\n  FROM public.tickets WHERE id = NEW.ticket_id;\n  \n  SELECT CASE \n    WHEN priority = 'high' THEN 720    -- 12 hours for high priority\n    WHEN priority = 'medium' THEN 1440 -- 24 hours for medium priority\n    WHEN priority = 'low' THEN 2880    -- 48 hours for low priority\n    ELSE 1440\n  END INTO sla_resolution_target\n  FROM public.tickets WHERE id = NEW.ticket_id;\n  \n  -- Insert or update SLA metrics\n  INSERT INTO public.ticket_sla_metrics (\n    ticket_id,\n    first_response_time_minutes,\n    resolution_time_minutes,\n    sla_target_response_minutes,\n    sla_target_resolution_minutes,\n    response_sla_met,\n    resolution_sla_met\n  ) VALUES (\n    NEW.ticket_id,\n    response_time_minutes,\n    resolution_time_minutes,\n    sla_response_target,\n    sla_resolution_target,\n    CASE WHEN response_time_minutes IS NULL THEN NULL \n         ELSE response_time_minutes <= sla_response_target END,\n    CASE WHEN resolution_time_minutes IS NULL THEN NULL \n         ELSE resolution_time_minutes <= sla_resolution_target END\n  )\n  ON CONFLICT (ticket_id) DO UPDATE SET\n    first_response_time_minutes = EXCLUDED.first_response_time_minutes,\n    resolution_time_minutes = EXCLUDED.resolution_time_minutes,\n    sla_target_response_minutes = EXCLUDED.sla_target_response_minutes,\n    sla_target_resolution_minutes = EXCLUDED.sla_target_resolution_minutes,\n    response_sla_met = EXCLUDED.response_sla_met,\n    resolution_sla_met = EXCLUDED.resolution_sla_met,\n    updated_at = now();\n    \n  RETURN NEW;\nEND;\n$function$;\n\nCREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nBEGIN\n  -- Escalate tickets that haven't received first response within SLA\n  UPDATE public.tickets \n  SET \n    priority = CASE \n      WHEN priority = 'low' THEN 'medium'\n      WHEN priority = 'medium' THEN 'high'\n      ELSE priority\n    END,\n    escalation_level = escalation_level + 1,\n    escalated_at = now()\n  WHERE \n    status NOT IN ('resolved', 'closed')\n    AND created_at < now() - INTERVAL '4 hours'\n    AND NOT EXISTS (\n      SELECT 1 FROM public.ticket_messages \n      WHERE ticket_id = tickets.id AND is_admin_message = true\n    );\n    \n  -- Escalate high priority tickets that are still open after 8 hours\n  UPDATE public.tickets \n  SET \n    escalation_level = escalation_level + 1,\n    escalated_at = now()\n  WHERE \n    priority = 'high'\n    AND status NOT IN ('resolved', 'closed')\n    AND created_at < now() - INTERVAL '8 hours'\n    AND escalation_level = 0;\nEND;\n$function$;\n\n-- Create audit log table for security monitoring\nCREATE TABLE IF NOT EXISTS public.audit_logs (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID,\n  action TEXT NOT NULL,\n  table_name TEXT,\n  record_id UUID,\n  old_values JSONB,\n  new_values JSONB,\n  ip_address INET,\n  user_agent TEXT,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Enable RLS on audit logs\nALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;\n\n-- Create policy for audit logs - only admins can view\nCREATE POLICY \\"Admins can view audit logs\\" \nON public.audit_logs \nFOR SELECT \nUSING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\n-- Create function to log changes\nCREATE OR REPLACE FUNCTION public.log_changes()\nRETURNS TRIGGER \nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path TO 'public'\nAS $function$\nBEGIN\n  IF TG_OP = 'INSERT' THEN\n    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)\n    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));\n    RETURN NEW;\n  ELSIF TG_OP = 'UPDATE' THEN\n    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)\n    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));\n    RETURN NEW;\n  ELSIF TG_OP = 'DELETE' THEN\n    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)\n    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));\n    RETURN OLD;\n  END IF;\n  RETURN NULL;\nEND;\n$function$;\n\n-- Add audit triggers to critical tables\nCREATE TRIGGER audit_telekom_data_changes\nAFTER INSERT OR UPDATE OR DELETE ON public.telekom_data\nFOR EACH ROW EXECUTE FUNCTION public.log_changes();\n\nCREATE TRIGGER audit_user_roles_changes\nAFTER INSERT OR UPDATE OR DELETE ON public.user_roles\nFOR EACH ROW EXECUTE FUNCTION public.log_changes();\n\nCREATE TRIGGER audit_tickets_changes\nAFTER INSERT OR UPDATE OR DELETE ON public.tickets\nFOR EACH ROW EXECUTE FUNCTION public.log_changes();"}		sarangrumah.dev@gmail.com	\N
20250805102838	{"-- Create API integration logs table\nCREATE TABLE public.api_integration_logs (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  user_id UUID REFERENCES auth.users,\n  api_name TEXT NOT NULL,\n  request_data JSONB,\n  response_data JSONB,\n  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),\n  response_time_ms INTEGER,\n  error_message TEXT,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()\n);\n\n-- Enable RLS\nALTER TABLE public.api_integration_logs ENABLE ROW LEVEL SECURITY;\n\n-- Create policies\nCREATE POLICY \\"Users can view their own API logs\\" \nON public.api_integration_logs \nFOR SELECT \nUSING (auth.uid() = user_id);\n\nCREATE POLICY \\"Users can create their own API logs\\" \nON public.api_integration_logs \nFOR INSERT \nWITH CHECK (auth.uid() = user_id);\n\nCREATE POLICY \\"Admins can view all API logs\\" \nON public.api_integration_logs \nFOR SELECT \nUSING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\n-- Create indexes for performance\nCREATE INDEX idx_api_integration_logs_user_id ON public.api_integration_logs(user_id);\nCREATE INDEX idx_api_integration_logs_api_name ON public.api_integration_logs(api_name);\nCREATE INDEX idx_api_integration_logs_status ON public.api_integration_logs(status);\nCREATE INDEX idx_api_integration_logs_created_at ON public.api_integration_logs(created_at);\n\n-- Add trigger for updated_at\nCREATE TRIGGER update_api_integration_logs_updated_at\n  BEFORE UPDATE ON public.api_integration_logs\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();\n\n-- Add audit logging trigger\nCREATE TRIGGER api_integration_logs_audit_trigger\n  AFTER INSERT OR UPDATE OR DELETE ON public.api_integration_logs\n  FOR EACH ROW\n  EXECUTE FUNCTION public.log_changes();"}		sarangrumah.dev@gmail.com	\N
20250909051246	{"-- Fix missing RLS policies for new tables\n\n-- Additional RLS policies for company_documents\nCREATE POLICY \\"Company admins can update their company documents\\" ON public.company_documents\nFOR UPDATE USING (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid() \n    AND user_profiles.is_company_admin = true\n  )\n);\n\nCREATE POLICY \\"Company admins can delete their company documents\\" ON public.company_documents\nFOR DELETE USING (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid() \n    AND user_profiles.is_company_admin = true\n  )\n);\n\n-- Additional RLS policies for pic_documents\nCREATE POLICY \\"Company admins can update PIC documents\\" ON public.pic_documents\nFOR UPDATE USING (\n  pic_id IN (\n    SELECT pic.id \n    FROM person_in_charge pic\n    JOIN user_profiles up ON pic.company_id = up.company_id\n    WHERE up.user_id = auth.uid() \n    AND up.is_company_admin = true\n  )\n);\n\nCREATE POLICY \\"Company admins can delete PIC documents\\" ON public.pic_documents\nFOR DELETE USING (\n  pic_id IN (\n    SELECT pic.id \n    FROM person_in_charge pic\n    JOIN user_profiles up ON pic.company_id = up.company_id\n    WHERE up.user_id = auth.uid() \n    AND up.is_company_admin = true\n  )\n);\n\n-- Additional RLS policies for person_in_charge\nCREATE POLICY \\"Company admins can insert PIC\\" ON public.person_in_charge\nFOR INSERT WITH CHECK (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid() \n    AND user_profiles.is_company_admin = true\n  )\n);\n\n-- Admin policies for all new tables\nCREATE POLICY \\"Admins can manage all company documents\\" ON public.company_documents\nFOR ALL USING (\n  has_role(auth.uid(), 'super_admin'::app_role) OR \n  has_role(auth.uid(), 'internal_admin'::app_role)\n);\n\nCREATE POLICY \\"Admins can manage all PIC records\\" ON public.person_in_charge\nFOR ALL USING (\n  has_role(auth.uid(), 'super_admin'::app_role) OR \n  has_role(auth.uid(), 'internal_admin'::app_role)\n);\n\nCREATE POLICY \\"Admins can manage all PIC documents\\" ON public.pic_documents\nFOR ALL USING (\n  has_role(auth.uid(), 'super_admin'::app_role) OR \n  has_role(auth.uid(), 'internal_admin'::app_role)\n);"}		sarangrumah.dev@gmail.com	\N
20250806044731	{"-- First, let's ensure we have an admin user by updating existing users\n-- This will help fix the authentication access issue\n\n-- Check if there are any existing users and grant them admin access\n-- We'll update the first user to be a super admin if no admin exists\nDO $$\nDECLARE\n    first_user_id uuid;\nBEGIN\n    -- Get the first user ID from profiles\n    SELECT user_id INTO first_user_id \n    FROM public.profiles \n    ORDER BY created_at \n    LIMIT 1;\n    \n    -- If we found a user, ensure they have admin role\n    IF first_user_id IS NOT NULL THEN\n        -- Remove any existing roles for this user first\n        DELETE FROM public.user_roles WHERE user_id = first_user_id;\n        \n        -- Add super_admin role\n        INSERT INTO public.user_roles (user_id, role) \n        VALUES (first_user_id, 'super_admin');\n        \n        -- Ensure the profile is validated\n        UPDATE public.profiles \n        SET is_validated = true \n        WHERE user_id = first_user_id;\n    END IF;\nEND $$;"}		sarangrumah.dev@gmail.com	\N
20250817051758	{"-- Phase 1: Create Core Permission Tables\n\n-- System modules definition\nCREATE TABLE IF NOT EXISTS public.modules (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL UNIQUE,\n  description TEXT,\n  parent_module_id UUID REFERENCES public.modules(id),\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Fields within modules\nCREATE TABLE IF NOT EXISTS public.fields (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL,\n  field_type TEXT NOT NULL DEFAULT 'text', -- text, number, date, select, file, etc.\n  is_system_field BOOLEAN NOT NULL DEFAULT false,\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  UNIQUE(module_id, code)\n);\n\n-- Role-based permissions with CRUD and field-level access\nCREATE TABLE IF NOT EXISTS public.permissions (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  role app_role NOT NULL,\n  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,\n  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,\n  \n  -- CRUD permissions\n  can_create BOOLEAN NOT NULL DEFAULT false,\n  can_read BOOLEAN NOT NULL DEFAULT false,\n  can_update BOOLEAN NOT NULL DEFAULT false,\n  can_delete BOOLEAN NOT NULL DEFAULT false,\n  \n  -- Field-level permissions\n  field_access TEXT DEFAULT 'read_only', -- hidden, read_only, editable, required\n  \n  -- Conditional permissions (JSON rules)\n  conditions JSONB DEFAULT '{}',\n  \n  -- Metadata\n  created_by UUID REFERENCES auth.users(id),\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  \n  -- Ensure unique permission per role-module-field combination\n  UNIQUE(role, module_id, field_id)\n);\n\n-- Record-level permissions for granular access control\nCREATE TABLE IF NOT EXISTS public.record_permissions (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  table_name TEXT NOT NULL,\n  record_id UUID NOT NULL,\n  user_id UUID NOT NULL,\n  permission_type TEXT NOT NULL, -- create, read, update, delete\n  granted_by UUID REFERENCES auth.users(id),\n  expires_at TIMESTAMP WITH TIME ZONE,\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  \n  UNIQUE(table_name, record_id, user_id, permission_type)\n);\n\n-- Permission templates for quick role setup\nCREATE TABLE IF NOT EXISTS public.permission_templates (\n  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  description TEXT,\n  target_role app_role NOT NULL,\n  permissions_config JSONB NOT NULL DEFAULT '{}',\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  created_by UUID REFERENCES auth.users(id),\n  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()\n);\n\n-- Enable RLS on all permission tables\nALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.record_permissions ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;\n\n-- Create RLS policies for permission tables\nCREATE POLICY \\"Admins can manage modules\\" ON public.modules\nFOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\nCREATE POLICY \\"Everyone can view active modules\\" ON public.modules\nFOR SELECT USING (is_active = true);\n\nCREATE POLICY \\"Admins can manage fields\\" ON public.fields\nFOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\nCREATE POLICY \\"Everyone can view active fields\\" ON public.fields\nFOR SELECT USING (is_active = true);\n\nCREATE POLICY \\"Admins can manage permissions\\" ON public.permissions\nFOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\nCREATE POLICY \\"Users can view permissions for their role\\" ON public.permissions\nFOR SELECT USING (\n  EXISTS (\n    SELECT 1 FROM public.user_roles \n    WHERE user_id = auth.uid() AND user_roles.role = permissions.role\n  )\n);\n\nCREATE POLICY \\"Admins can manage record permissions\\" ON public.record_permissions\nFOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\nCREATE POLICY \\"Users can view their own record permissions\\" ON public.record_permissions\nFOR SELECT USING (user_id = auth.uid());\n\nCREATE POLICY \\"Admins can manage permission templates\\" ON public.permission_templates\nFOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));\n\nCREATE POLICY \\"Everyone can view active permission templates\\" ON public.permission_templates\nFOR SELECT USING (is_active = true);\n\n-- Create triggers for updated_at columns\nCREATE TRIGGER update_modules_updated_at\n  BEFORE UPDATE ON public.modules\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_fields_updated_at\n  BEFORE UPDATE ON public.fields\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_permissions_updated_at\n  BEFORE UPDATE ON public.permissions\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_permission_templates_updated_at\n  BEFORE UPDATE ON public.permission_templates\n  FOR EACH ROW\n  EXECUTE FUNCTION public.update_updated_at_column();"}		sarangrumah.dev@gmail.com	\N
20250817052142	{"-- Phase 2: Create Permission Functions and Seed Data\n\n-- Function to check user permission for a specific action\nCREATE OR REPLACE FUNCTION public.check_user_permission(\n  _user_id UUID,\n  _module_code TEXT,\n  _action TEXT, -- create, read, update, delete\n  _field_code TEXT DEFAULT NULL\n)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nSTABLE SECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n  _user_roles app_role[];\n  _has_permission BOOLEAN := false;\n  _permission_record permissions%ROWTYPE;\nBEGIN\n  -- Get all roles for the user\n  SELECT ARRAY_AGG(role) INTO _user_roles\n  FROM public.user_roles\n  WHERE user_id = _user_id;\n  \n  -- If no roles, return false\n  IF _user_roles IS NULL OR array_length(_user_roles, 1) = 0 THEN\n    RETURN false;\n  END IF;\n  \n  -- Check for module-level permission\n  FOR _permission_record IN\n    SELECT p.*\n    FROM public.permissions p\n    JOIN public.modules m ON p.module_id = m.id\n    WHERE m.code = _module_code\n      AND p.role = ANY(_user_roles)\n      AND (_field_code IS NULL OR p.field_id IS NULL)\n  LOOP\n    CASE _action\n      WHEN 'create' THEN _has_permission := _permission_record.can_create;\n      WHEN 'read' THEN _has_permission := _permission_record.can_read;\n      WHEN 'update' THEN _has_permission := _permission_record.can_update;\n      WHEN 'delete' THEN _has_permission := _permission_record.can_delete;\n      ELSE _has_permission := false;\n    END CASE;\n    \n    -- If permission found, return true\n    IF _has_permission THEN\n      RETURN true;\n    END IF;\n  END LOOP;\n  \n  -- Check field-level permission if field_code provided\n  IF _field_code IS NOT NULL THEN\n    FOR _permission_record IN\n      SELECT p.*\n      FROM public.permissions p\n      JOIN public.modules m ON p.module_id = m.id\n      JOIN public.fields f ON p.field_id = f.id\n      WHERE m.code = _module_code\n        AND f.code = _field_code\n        AND p.role = ANY(_user_roles)\n    LOOP\n      CASE _action\n        WHEN 'create' THEN _has_permission := _permission_record.can_create;\n        WHEN 'read' THEN _has_permission := _permission_record.can_read;\n        WHEN 'update' THEN _has_permission := _permission_record.can_update;\n        WHEN 'delete' THEN _has_permission := _permission_record.can_delete;\n        ELSE _has_permission := false;\n      END CASE;\n      \n      IF _has_permission THEN\n        RETURN true;\n      END IF;\n    END LOOP;\n  END IF;\n  \n  RETURN false;\nEND;\n$$;\n\n-- Function to check record-level permission\nCREATE OR REPLACE FUNCTION public.check_record_permission(\n  _user_id UUID,\n  _table_name TEXT,\n  _record_id UUID,\n  _action TEXT\n)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nSTABLE SECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  RETURN EXISTS (\n    SELECT 1\n    FROM public.record_permissions\n    WHERE user_id = _user_id\n      AND table_name = _table_name\n      AND record_id = _record_id\n      AND permission_type = _action\n      AND (expires_at IS NULL OR expires_at > now())\n  );\nEND;\n$$;\n\n-- Function to get user permissions for a module\nCREATE OR REPLACE FUNCTION public.get_user_permissions(\n  _user_id UUID,\n  _module_code TEXT DEFAULT NULL\n)\nRETURNS TABLE (\n  module_code TEXT,\n  module_name TEXT,\n  field_code TEXT,\n  field_name TEXT,\n  can_create BOOLEAN,\n  can_read BOOLEAN,\n  can_update BOOLEAN,\n  can_delete BOOLEAN,\n  field_access TEXT\n)\nLANGUAGE plpgsql\nSTABLE SECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n  _user_roles app_role[];\nBEGIN\n  -- Get all roles for the user\n  SELECT ARRAY_AGG(role) INTO _user_roles\n  FROM public.user_roles\n  WHERE user_id = _user_id;\n  \n  -- Return permissions for user's roles\n  RETURN QUERY\n  SELECT \n    m.code as module_code,\n    m.name as module_name,\n    COALESCE(f.code, '') as field_code,\n    COALESCE(f.name, '') as field_name,\n    p.can_create,\n    p.can_read,\n    p.can_update,\n    p.can_delete,\n    p.field_access\n  FROM public.permissions p\n  JOIN public.modules m ON p.module_id = m.id\n  LEFT JOIN public.fields f ON p.field_id = f.id\n  WHERE p.role = ANY(_user_roles)\n    AND (_module_code IS NULL OR m.code = _module_code)\n    AND m.is_active = true\n    AND (f.id IS NULL OR f.is_active = true)\n  ORDER BY m.code, f.code;\nEND;\n$$;\n\n-- Seed initial modules\nINSERT INTO public.modules (name, code, description) VALUES\n('Dashboard', 'dashboard', 'Main dashboard and analytics'),\n('Data Management', 'data_management', 'Telecommunications data management'),\n('Data Visualization', 'data_visualization', 'Data charts and visualization'),\n('FAQ Management', 'faq', 'FAQ content management'),\n('Support/Tickets', 'support', 'Support ticket system'),\n('User Management', 'user_management', 'User and role management'),\n('Admin FAQ', 'admin_faq', 'Administrative FAQ management'),\n('Admin Tickets', 'admin_tickets', 'Administrative ticket management')\nON CONFLICT (code) DO NOTHING;\n\n-- Seed fields for Data Management module\nINSERT INTO public.fields (module_id, name, code, field_type, is_system_field)\nSELECT \n  m.id,\n  field_name,\n  field_code,\n  field_type,\n  is_system\nFROM public.modules m\nCROSS JOIN (VALUES\n  ('Company Name', 'company_name', 'text', true),\n  ('Service Type', 'service_type', 'select', true),\n  ('Sub Service Type', 'sub_service_type', 'text', false),\n  ('License Number', 'license_number', 'text', false),\n  ('Province', 'province_id', 'select', false),\n  ('Kabupaten/Kota', 'kabupaten_id', 'select', false),\n  ('Status', 'status', 'select', false),\n  ('License Date', 'license_date', 'date', false),\n  ('Region', 'region', 'text', false),\n  ('Latitude', 'latitude', 'number', false),\n  ('Longitude', 'longitude', 'number', false),\n  ('File Document', 'file_url', 'file', false),\n  ('Data Source', 'data_source', 'text', true),\n  ('Created By', 'created_by', 'text', true),\n  ('Created At', 'created_at', 'date', true),\n  ('Updated At', 'updated_at', 'date', true)\n) AS fields(field_name, field_code, field_type, is_system)\nWHERE m.code = 'data_management'\nON CONFLICT (module_id, code) DO NOTHING;"}		sarangrumah.dev@gmail.com	\N
20250817052309	{"-- Phase 3: Create Default Permissions for Existing Roles\n\n-- Create default permissions for super_admin (full access)\nINSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)\nSELECT \n  'super_admin'::app_role,\n  m.id,\n  true,\n  true,\n  true,\n  true\nFROM public.modules m\nON CONFLICT (role, module_id, field_id) DO UPDATE SET\n  can_create = EXCLUDED.can_create,\n  can_read = EXCLUDED.can_read,\n  can_update = EXCLUDED.can_update,\n  can_delete = EXCLUDED.can_delete;\n\n-- Create default permissions for internal_admin\nINSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)\nSELECT \n  'internal_admin'::app_role,\n  m.id,\n  CASE \n    WHEN m.code IN ('data_management', 'faq', 'support', 'admin_faq', 'admin_tickets') THEN true\n    ELSE false\n  END,\n  true,\n  CASE \n    WHEN m.code IN ('data_management', 'faq', 'support', 'admin_faq', 'admin_tickets') THEN true\n    ELSE false\n  END,\n  CASE \n    WHEN m.code IN ('data_management', 'faq', 'support', 'admin_faq', 'admin_tickets') THEN true\n    ELSE false\n  END\nFROM public.modules m\nON CONFLICT (role, module_id, field_id) DO UPDATE SET\n  can_create = EXCLUDED.can_create,\n  can_read = EXCLUDED.can_read,\n  can_update = EXCLUDED.can_update,\n  can_delete = EXCLUDED.can_delete;\n\n-- Create default permissions for pengolah_data\nINSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)\nSELECT \n  'pengolah_data'::app_role,\n  m.id,\n  CASE \n    WHEN m.code IN ('data_management', 'support') THEN true\n    ELSE false\n  END,\n  CASE \n    WHEN m.code IN ('dashboard', 'data_management', 'data_visualization', 'faq', 'support') THEN true\n    ELSE false\n  END,\n  CASE \n    WHEN m.code IN ('data_management', 'support') THEN true\n    ELSE false\n  END,\n  CASE \n    WHEN m.code IN ('data_management', 'support') THEN true\n    ELSE false\n  END\nFROM public.modules m\nON CONFLICT (role, module_id, field_id) DO UPDATE SET\n  can_create = EXCLUDED.can_create,\n  can_read = EXCLUDED.can_read,\n  can_update = EXCLUDED.can_update,\n  can_delete = EXCLUDED.can_delete;\n\n-- Create default permissions for pelaku_usaha (limited to their own data)\nINSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete, conditions)\nSELECT \n  'pelaku_usaha'::app_role,\n  m.id,\n  CASE \n    WHEN m.code IN ('data_management', 'support') THEN true\n    ELSE false\n  END,\n  CASE \n    WHEN m.code IN ('dashboard', 'data_management', 'data_visualization', 'faq', 'support') THEN true\n    ELSE false\n  END,\n  CASE \n    WHEN m.code IN ('data_management', 'support') THEN true\n    ELSE false\n  END,\n  false, -- Can't delete others' data\n  CASE \n    WHEN m.code = 'data_management' THEN '{\\"own_records_only\\": true}'::jsonb\n    WHEN m.code = 'support' THEN '{\\"own_tickets_only\\": true}'::jsonb\n    ELSE '{}'::jsonb\n  END\nFROM public.modules m\nON CONFLICT (role, module_id, field_id) DO UPDATE SET\n  can_create = EXCLUDED.can_create,\n  can_read = EXCLUDED.can_read,\n  can_update = EXCLUDED.can_update,\n  can_delete = EXCLUDED.can_delete,\n  conditions = EXCLUDED.conditions;\n\n-- Create default permissions for internal_group\nINSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)\nSELECT \n  'internal_group'::app_role,\n  m.id,\n  false,\n  CASE \n    WHEN m.code IN ('dashboard', 'data_visualization', 'faq') THEN true\n    ELSE false\n  END,\n  false,\n  false\nFROM public.modules m\nON CONFLICT (role, module_id, field_id) DO UPDATE SET\n  can_create = EXCLUDED.can_create,\n  can_read = EXCLUDED.can_read,\n  can_update = EXCLUDED.can_update,\n  can_delete = EXCLUDED.can_delete;\n\n-- Create default permissions for guest (very limited)\nINSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)\nSELECT \n  'guest'::app_role,\n  m.id,\n  false,\n  CASE \n    WHEN m.code IN ('faq') THEN true\n    ELSE false\n  END,\n  false,\n  false\nFROM public.modules m\nON CONFLICT (role, module_id, field_id) DO UPDATE SET\n  can_create = EXCLUDED.can_create,\n  can_read = EXCLUDED.can_read,\n  can_update = EXCLUDED.can_update,\n  can_delete = EXCLUDED.can_delete;"}		sarangrumah.dev@gmail.com	\N
20250909024853	{"-- Create a policy to allow public search with limited columns\nCREATE POLICY \\"Public can search with limited data view\\" \nON public.telekom_data \nFOR SELECT \nUSING (true);\n\n-- Update the existing restrictive policy to be more specific\nDROP POLICY IF EXISTS \\"Validated users can view telekom data\\" ON public.telekom_data;\n\n-- Create a new policy for full data access for validated users\nCREATE POLICY \\"Validated users can view full telekom data\\" \nON public.telekom_data \nFOR SELECT \nUSING (\n  -- Allow public to see limited columns OR validated users to see all\n  EXISTS ( \n    SELECT 1\n    FROM profiles\n    WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true))\n  )\n);"}		sarangrumah.dev@gmail.com	\N
20250909025013	{"-- Fix the RLS policy to be more secure\n-- Drop the overly permissive policy\nDROP POLICY IF EXISTS \\"Public can search with limited data view\\" ON public.telekom_data;\n\n-- Create a more secure policy that allows limited public access\nCREATE POLICY \\"Public limited search access\\" \nON public.telekom_data \nFOR SELECT \nUSING (\n  -- If user is authenticated and validated, show all data\n  CASE \n    WHEN auth.uid() IS NOT NULL THEN \n      EXISTS ( \n        SELECT 1\n        FROM profiles\n        WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true))\n      )\n    -- If user is not authenticated, allow access but app will filter columns\n    ELSE true\n  END\n);"}		sarangrumah.dev@gmail.com	\N
20250909035806	{"-- Update the handle_new_user function to assign pelaku_usaha role instead of guest\nCREATE OR REPLACE FUNCTION public.handle_new_user()\nRETURNS trigger\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = 'public'\nAS $function$\nBEGIN\n  INSERT INTO public.profiles (user_id, full_name)\n  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));\n  \n  -- Set default role to pelaku_usaha for registered users (not guest)\n  INSERT INTO public.user_roles (user_id, role)\n  VALUES (NEW.id, 'pelaku_usaha');\n  \n  RETURN NEW;\nEND;\n$function$;\n\n-- Update existing user with guest role to pelaku_usaha\nUPDATE public.user_roles \nSET role = 'pelaku_usaha'\nWHERE role = 'guest' \n  AND user_id IN (\n    SELECT id FROM auth.users \n    WHERE email = 'dev.ademaryadi@gmail.com'\n  );"}		sarangrumah.dev@gmail.com	\N
20250909050831	{"-- Enhanced Registration Schema\n-- Create enum for document types\nCREATE TYPE public.document_type AS ENUM (\n  'nib',\n  'npwp',\n  'akta',\n  'ktp',\n  'assignment_letter'\n);\n\n-- Create enum for company types\nCREATE TYPE public.company_type AS ENUM (\n  'pt',\n  'cv',\n  'ud',\n  'koperasi',\n  'yayasan',\n  'other'\n);\n\n-- Update companies table with comprehensive fields\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS nib_number TEXT UNIQUE;\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS npwp_number TEXT;\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_type public.company_type;\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS akta_number TEXT;\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES public.provinces(id);\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kabupaten_id UUID REFERENCES public.kabupaten(id);\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kecamatan TEXT;\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kelurahan TEXT;\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS postal_code TEXT;\n\n-- Create company_documents table\nCREATE TABLE IF NOT EXISTS public.company_documents (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,\n  document_type public.document_type NOT NULL,\n  file_path TEXT NOT NULL,\n  file_name TEXT NOT NULL,\n  file_size INTEGER NOT NULL,\n  mime_type TEXT NOT NULL DEFAULT 'application/pdf',\n  uploaded_by UUID NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  UNIQUE(company_id, document_type)\n);\n\n-- Create person_in_charge (PIC) table  \nCREATE TABLE IF NOT EXISTS public.person_in_charge (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,\n  full_name TEXT NOT NULL,\n  id_number TEXT NOT NULL,\n  phone_number TEXT NOT NULL,\n  position TEXT NOT NULL,\n  province_id UUID REFERENCES public.provinces(id),\n  kabupaten_id UUID REFERENCES public.kabupaten(id),\n  kecamatan TEXT,\n  kelurahan TEXT,\n  postal_code TEXT,\n  address TEXT NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()\n);\n\n-- Create PIC documents table\nCREATE TABLE IF NOT EXISTS public.pic_documents (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  pic_id UUID NOT NULL REFERENCES public.person_in_charge(id) ON DELETE CASCADE,\n  document_type public.document_type NOT NULL,\n  file_path TEXT NOT NULL,\n  file_name TEXT NOT NULL,\n  file_size INTEGER NOT NULL,\n  mime_type TEXT NOT NULL DEFAULT 'application/pdf',\n  uploaded_by UUID NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  UNIQUE(pic_id, document_type)\n);\n\n-- Add maksud_tujuan (purpose) field to profiles\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS maksud_tujuan TEXT;\n\n-- Enable RLS on new tables\nALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.person_in_charge ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.pic_documents ENABLE ROW LEVEL SECURITY;\n\n-- RLS policies for company_documents\nCREATE POLICY \\"Users can view documents from their company\\" ON public.company_documents\nFOR SELECT USING (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid()\n  )\n);\n\nCREATE POLICY \\"Company admins can insert documents\\" ON public.company_documents\nFOR INSERT WITH CHECK (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid() \n    AND user_profiles.is_company_admin = true\n  )\n  AND uploaded_by = auth.uid()\n);\n\n-- RLS policies for person_in_charge\nCREATE POLICY \\"Users can view PIC from their company\\" ON public.person_in_charge\nFOR SELECT USING (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid()\n  )\n);\n\nCREATE POLICY \\"Company admins can manage PIC\\" ON public.person_in_charge\nFOR ALL USING (\n  company_id IN (\n    SELECT user_profiles.company_id \n    FROM user_profiles \n    WHERE user_profiles.user_id = auth.uid() \n    AND user_profiles.is_company_admin = true\n  )\n);\n\n-- RLS policies for pic_documents  \nCREATE POLICY \\"Users can view PIC documents from their company\\" ON public.pic_documents\nFOR SELECT USING (\n  pic_id IN (\n    SELECT pic.id \n    FROM person_in_charge pic\n    JOIN user_profiles up ON pic.company_id = up.company_id\n    WHERE up.user_id = auth.uid()\n  )\n);\n\nCREATE POLICY \\"Company admins can insert PIC documents\\" ON public.pic_documents\nFOR INSERT WITH CHECK (\n  pic_id IN (\n    SELECT pic.id \n    FROM person_in_charge pic\n    JOIN user_profiles up ON pic.company_id = up.company_id\n    WHERE up.user_id = auth.uid() \n    AND up.is_company_admin = true\n  )\n  AND uploaded_by = auth.uid()\n);\n\n-- Create triggers for updated_at\nCREATE TRIGGER update_company_documents_updated_at\n  BEFORE UPDATE ON public.company_documents\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_person_in_charge_updated_at\n  BEFORE UPDATE ON public.person_in_charge\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\nCREATE TRIGGER update_pic_documents_updated_at\n  BEFORE UPDATE ON public.pic_documents\n  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\n\n-- Create indexes for performance\nCREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON public.company_documents(company_id);\nCREATE INDEX IF NOT EXISTS idx_person_in_charge_company_id ON public.person_in_charge(company_id);\nCREATE INDEX IF NOT EXISTS idx_pic_documents_pic_id ON public.pic_documents(pic_id);\nCREATE INDEX IF NOT EXISTS idx_companies_nib_number ON public.companies(nib_number);\nCREATE INDEX IF NOT EXISTS idx_companies_npwp_number ON public.companies(npwp_number);"}		sarangrumah.dev@gmail.com	\N
20250909060609	{"-- Insert sample kecamatan data for Jakarta Pusat (01.71.01)\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('0171010101', 'Gambir', 'kecamatan', '01.71.01'),\n('0171010102', 'Sawah Besar', 'kecamatan', '01.71.01'),\n('0171010103', 'Kemayoran', 'kecamatan', '01.71.01'),\n('0171010104', 'Senen', 'kecamatan', '01.71.01'),\n('0171010105', 'Cempaka Putih', 'kecamatan', '01.71.01'),\n('0171010106', 'Menteng', 'kecamatan', '01.71.01'),\n('0171010107', 'Tanah Abang', 'kecamatan', '01.71.01'),\n('0171010108', 'Johar Baru', 'kecamatan', '01.71.01');\n\n-- Insert sample kecamatan data for Jakarta Selatan (01.71.02)\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('0171020101', 'Jagakarsa', 'kecamatan', '01.71.02'),\n('0171020102', 'Pasar Minggu', 'kecamatan', '01.71.02'),\n('0171020103', 'Cilandak', 'kecamatan', '01.71.02'),\n('0171020104', 'Pesanggrahan', 'kecamatan', '01.71.02'),\n('0171020105', 'Kebayoran Lama', 'kecamatan', '01.71.02'),\n('0171020106', 'Kebayoran Baru', 'kecamatan', '01.71.02'),\n('0171020107', 'Mampang Prapatan', 'kecamatan', '01.71.02'),\n('0171020108', 'Pancoran', 'kecamatan', '01.71.02'),\n('0171020109', 'Tebet', 'kecamatan', '01.71.02'),\n('0171020110', 'Setia Budi', 'kecamatan', '01.71.02');\n\n-- Insert sample kelurahan for Gambir kecamatan\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('0171010111', 'Gambir', 'kelurahan', '0171010101'),\n('0171010112', 'Cideng', 'kelurahan', '0171010101'),\n('0171010113', 'Petojo Selatan', 'kelurahan', '0171010101'),\n('0171010114', 'Duri Pulo', 'kelurahan', '0171010101'),\n('0171010115', 'Kebon Kelapa', 'kelurahan', '0171010101'),\n('0171010116', 'Petojo Utara', 'kelurahan', '0171010101');\n\n-- Insert sample kelurahan for Menteng kecamatan\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('0171010611', 'Menteng', 'kelurahan', '0171010106'),\n('0171010612', 'Pegangsaan', 'kelurahan', '0171010106'),\n('0171010613', 'Cikini', 'kelurahan', '0171010106'),\n('0171010614', 'Gondangdia', 'kelurahan', '0171010106'),\n('0171010615', 'Kebon Sirih', 'kelurahan', '0171010106');\n\n-- Insert sample kelurahan for Kebayoran Baru kecamatan  \nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('0171020621', 'Senayan', 'kelurahan', '0171020106'),\n('0171020622', 'Melawai', 'kelurahan', '0171020106'),\n('0171020623', 'Petogogan', 'kelurahan', '0171020106'),\n('0171020624', 'Gandaria Utara', 'kelurahan', '0171020106'),\n('0171020625', 'Kramat Pela', 'kelurahan', '0171020106'),\n('0171020626', 'Gunung', 'kelurahan', '0171020106'),\n('0171020627', 'Rawa Barat', 'kelurahan', '0171020106'),\n('0171020628', 'Cipete Utara', 'kelurahan', '0171020106'),\n('0171020629', 'Pulo', 'kelurahan', '0171020106');"}		sarangrumah.dev@gmail.com	\N
20250909063108	{"-- Delete existing sample data with wrong parent_ids\nDELETE FROM indonesian_regions WHERE type IN ('kecamatan', 'kelurahan');\n\n-- Insert sample kecamatan data for Jakarta Pusat (code: 3173)\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('3173.01', 'Gambir', 'kecamatan', '3173'),\n('3173.02', 'Sawah Besar', 'kecamatan', '3173'),  \n('3173.03', 'Kemayoran', 'kecamatan', '3173'),\n('3173.04', 'Senen', 'kecamatan', '3173'),\n('3173.05', 'Cempaka Putih', 'kecamatan', '3173'),\n('3173.06', 'Menteng', 'kecamatan', '3173'),\n('3173.07', 'Tanah Abang', 'kecamatan', '3173'),\n('3173.08', 'Johar Baru', 'kecamatan', '3173');\n\n-- Insert sample kecamatan data for Jakarta Selatan (code: 3171) \nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('3171.01', 'Jagakarsa', 'kecamatan', '3171'),\n('3171.02', 'Pasar Minggu', 'kecamatan', '3171'),\n('3171.03', 'Cilandak', 'kecamatan', '3171'),\n('3171.04', 'Pesanggrahan', 'kecamatan', '3171'),\n('3171.05', 'Kebayoran Lama', 'kecamatan', '3171'),\n('3171.06', 'Kebayoran Baru', 'kecamatan', '3171'),\n('3171.07', 'Mampang Prapatan', 'kecamatan', '3171'),\n('3171.08', 'Pancoran', 'kecamatan', '3171'),\n('3171.09', 'Tebet', 'kecamatan', '3171'),\n('3171.10', 'Setia Budi', 'kecamatan', '3171');\n\n-- Insert sample kelurahan for Gambir kecamatan\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('3173.01.1', 'Gambir', 'kelurahan', '3173.01'),\n('3173.01.2', 'Cideng', 'kelurahan', '3173.01'),\n('3173.01.3', 'Petojo Selatan', 'kelurahan', '3173.01'),\n('3173.01.4', 'Duri Pulo', 'kelurahan', '3173.01'),\n('3173.01.5', 'Kebon Kelapa', 'kelurahan', '3173.01'),\n('3173.01.6', 'Petojo Utara', 'kelurahan', '3173.01');\n\n-- Insert sample kelurahan for Menteng kecamatan\nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('3173.06.1', 'Menteng', 'kelurahan', '3173.06'),\n('3173.06.2', 'Pegangsaan', 'kelurahan', '3173.06'),\n('3173.06.3', 'Cikini', 'kelurahan', '3173.06'),\n('3173.06.4', 'Gondangdia', 'kelurahan', '3173.06'),\n('3173.06.5', 'Kebon Sirih', 'kelurahan', '3173.06');\n\n-- Insert sample kelurahan for Kebayoran Baru kecamatan  \nINSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES\n('3171.06.1', 'Senayan', 'kelurahan', '3171.06'),\n('3171.06.2', 'Melawai', 'kelurahan', '3171.06'),\n('3171.06.3', 'Petogogan', 'kelurahan', '3171.06'),\n('3171.06.4', 'Gandaria Utara', 'kelurahan', '3171.06'),\n('3171.06.5', 'Kramat Pela', 'kelurahan', '3171.06'),\n('3171.06.6', 'Gunung', 'kelurahan', '3171.06'),\n('3171.06.7', 'Rawa Barat', 'kelurahan', '3171.06'),\n('3171.06.8', 'Cipete Utara', 'kelurahan', '3171.06'),\n('3171.06.9', 'Pulo', 'kelurahan', '3171.06');"}		sarangrumah.dev@gmail.com	\N
20250910035211	{"-- Add RLS policy to allow public read access to indonesian_regions table\nCREATE POLICY \\"Anyone can view indonesian regions\\" \nON public.indonesian_regions \nFOR SELECT \nUSING (true);"}		sarangrumah.dev@gmail.com	\N
20250910042205	{"-- Add RLS policies to allow unauthenticated users to upload documents for registration\n-- Policy for inserting documents - allow anyone to upload to temp/registration folder\nCREATE POLICY \\"Allow public upload for registration documents\\" \nON storage.objects \nFOR INSERT \nTO public\nWITH CHECK (\n  bucket_id = 'documents' \n  AND (storage.foldername(name))[1] = 'temp'\n);\n\n-- Policy for viewing documents - allow public read access to documents bucket\nCREATE POLICY \\"Allow public read access to documents\\" \nON storage.objects \nFOR SELECT \nTO public\nUSING (bucket_id = 'documents');\n\n-- Policy for authenticated users to manage their own documents\nCREATE POLICY \\"Users can manage their own documents\\" \nON storage.objects \nFOR ALL \nTO authenticated\nUSING (\n  bucket_id = 'documents' \n  AND auth.uid()::text = (storage.foldername(name))[1]\n)\nWITH CHECK (\n  bucket_id = 'documents' \n  AND auth.uid()::text = (storage.foldername(name))[1]\n);"}		sarangrumah.dev@gmail.com	\N
20250910055853	{"-- Create database functions for company management\nCREATE OR REPLACE FUNCTION public.approve_company(\n  _company_id UUID,\n  _verified_by UUID,\n  _notes TEXT DEFAULT NULL\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  -- Check if user has permission to approve companies\n  IF NOT (has_role(_verified_by, 'super_admin') OR has_role(_verified_by, 'internal_admin')) THEN\n    RAISE EXCEPTION 'Insufficient permissions to approve companies';\n  END IF;\n\n  -- Update company status to verified\n  UPDATE public.companies\n  SET \n    status = 'verified',\n    verified_at = now(),\n    verified_by = _verified_by,\n    verification_notes = _notes,\n    updated_at = now()\n  WHERE id = _company_id;\n\n  -- Update associated user profiles to validated status\n  UPDATE public.profiles\n  SET \n    is_validated = true,\n    updated_at = now()\n  WHERE user_id IN (\n    SELECT up.user_id \n    FROM user_profiles up \n    WHERE up.company_id = _company_id\n  );\nEND;\n$$;\n\n-- Create function to reject company\nCREATE OR REPLACE FUNCTION public.reject_company(\n  _company_id UUID,\n  _rejected_by UUID,\n  _rejection_notes TEXT\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  -- Check if user has permission to reject companies\n  IF NOT (has_role(_rejected_by, 'super_admin') OR has_role(_rejected_by, 'internal_admin')) THEN\n    RAISE EXCEPTION 'Insufficient permissions to reject companies';\n  END IF;\n\n  -- Update company status to rejected\n  UPDATE public.companies\n  SET \n    status = 'rejected',\n    verified_by = _rejected_by,\n    verification_notes = _rejection_notes,\n    updated_at = now()\n  WHERE id = _company_id;\nEND;\n$$;\n\n-- Create function to get companies with details for management\nCREATE OR REPLACE FUNCTION public.get_companies_for_management()\nRETURNS TABLE(\n  company_id UUID,\n  company_name TEXT,\n  email TEXT,\n  phone TEXT,\n  nib_number TEXT,\n  npwp_number TEXT,\n  akta_number TEXT,\n  status company_status,\n  created_at TIMESTAMP WITH TIME ZONE,\n  verified_at TIMESTAMP WITH TIME ZONE,\n  verified_by UUID,\n  verification_notes TEXT,\n  verifier_name TEXT,\n  pic_count BIGINT,\n  document_count BIGINT\n)\nLANGUAGE plpgsql\nSTABLE SECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  RETURN QUERY\n  SELECT \n    c.id as company_id,\n    c.company_name,\n    c.email,\n    c.phone,\n    c.nib_number,\n    c.npwp_number,\n    c.akta_number,\n    c.status,\n    c.created_at,\n    c.verified_at,\n    c.verified_by,\n    c.verification_notes,\n    p.full_name as verifier_name,\n    COALESCE(pic_counts.pic_count, 0) as pic_count,\n    COALESCE(doc_counts.document_count, 0) as document_count\n  FROM public.companies c\n  LEFT JOIN public.profiles p ON c.verified_by = p.user_id\n  LEFT JOIN (\n    SELECT company_id, COUNT(*) as pic_count\n    FROM public.person_in_charge\n    GROUP BY company_id\n  ) pic_counts ON c.id = pic_counts.company_id\n  LEFT JOIN (\n    SELECT company_id, COUNT(*) as document_count\n    FROM public.company_documents\n    GROUP BY company_id\n  ) doc_counts ON c.id = doc_counts.company_id\n  ORDER BY \n    CASE c.status \n      WHEN 'pending_verification' THEN 1\n      WHEN 'verified' THEN 2\n      WHEN 'rejected' THEN 3\n      ELSE 4\n    END,\n    c.created_at DESC;\nEND;\n$$;\n\n-- Add RLS policies for company management functions\nCREATE POLICY \\"Admins can call company management functions\\"\nON public.companies\nFOR ALL\nTO authenticated\nUSING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin'));"}		sarangrumah.dev@gmail.com	\N
20250910060324	{"-- Fix the ambiguous column reference in get_companies_for_management function\nCREATE OR REPLACE FUNCTION public.get_companies_for_management()\nRETURNS TABLE(\n  company_id UUID,\n  company_name TEXT,\n  email TEXT,\n  phone TEXT,\n  nib_number TEXT,\n  npwp_number TEXT,\n  akta_number TEXT,\n  status company_status,\n  created_at TIMESTAMP WITH TIME ZONE,\n  verified_at TIMESTAMP WITH TIME ZONE,\n  verified_by UUID,\n  verification_notes TEXT,\n  verifier_name TEXT,\n  pic_count BIGINT,\n  document_count BIGINT\n)\nLANGUAGE plpgsql\nSTABLE SECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  RETURN QUERY\n  SELECT \n    c.id as company_id,\n    c.company_name,\n    c.email,\n    c.phone,\n    c.nib_number,\n    c.npwp_number,\n    c.akta_number,\n    c.status,\n    c.created_at,\n    c.verified_at,\n    c.verified_by,\n    c.verification_notes,\n    p.full_name as verifier_name,\n    COALESCE(pic_counts.pic_count, 0) as pic_count,\n    COALESCE(doc_counts.document_count, 0) as document_count\n  FROM public.companies c\n  LEFT JOIN public.profiles p ON c.verified_by = p.user_id\n  LEFT JOIN (\n    SELECT pic.company_id, COUNT(*) as pic_count\n    FROM public.person_in_charge pic\n    GROUP BY pic.company_id\n  ) pic_counts ON c.id = pic_counts.company_id\n  LEFT JOIN (\n    SELECT cd.company_id, COUNT(*) as document_count\n    FROM public.company_documents cd\n    GROUP BY cd.company_id\n  ) doc_counts ON c.id = doc_counts.company_id\n  ORDER BY \n    CASE c.status \n      WHEN 'pending_verification' THEN 1\n      WHEN 'verified' THEN 2\n      WHEN 'rejected' THEN 3\n      ELSE 4\n    END,\n    c.created_at DESC;\nEND;\n$$;"}		sarangrumah.dev@gmail.com	\N
20250910061935	{"-- Add correction status and field-specific corrections to companies table\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS correction_notes JSONB DEFAULT '{}';\n\n-- Create enum for correction status if it doesn't exist\nDO $$ BEGIN\n    CREATE TYPE correction_status AS ENUM ('pending_correction', 'corrected');\nEXCEPTION\n    WHEN duplicate_object THEN null;\nEND $$;\n\n-- Add correction status column\nALTER TABLE public.companies ADD COLUMN IF NOT EXISTS correction_status correction_status DEFAULT NULL;\n\n-- Update company_status enum to include correction\nALTER TYPE company_status ADD VALUE IF NOT EXISTS 'needs_correction';"}		sarangrumah.dev@gmail.com	\N
20250910062054	{"-- Create correction functions for companies\nCREATE OR REPLACE FUNCTION public.request_company_correction(\n  _company_id UUID,\n  _requested_by UUID,\n  _correction_notes JSONB\n)\nRETURNS VOID\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  -- Check if user has permission to request corrections\n  IF NOT (has_role(_requested_by, 'super_admin'::app_role) OR has_role(_requested_by, 'internal_admin'::app_role)) THEN\n    RAISE EXCEPTION 'Insufficient permissions to request corrections';\n  END IF;\n\n  -- Update company status to needs correction\n  UPDATE public.companies\n  SET \n    status = 'needs_correction',\n    correction_notes = _correction_notes,\n    correction_status = 'pending_correction',\n    updated_at = now()\n  WHERE id = _company_id;\nEND;\n$$;\n\n-- Create function to submit corrections\nCREATE OR REPLACE FUNCTION public.submit_company_corrections(\n  _company_id UUID,\n  _submitted_by UUID,\n  _updated_data JSONB\n)\nRETURNS VOID\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  -- Check if user belongs to the company\n  IF NOT EXISTS (\n    SELECT 1 FROM public.user_profiles \n    WHERE user_id = _submitted_by AND company_id = _company_id\n  ) THEN\n    RAISE EXCEPTION 'User does not belong to this company';\n  END IF;\n\n  -- Update company status back to pending verification\n  UPDATE public.companies\n  SET \n    status = 'pending_verification',\n    correction_status = 'corrected',\n    updated_at = now()\n  WHERE id = _company_id AND status = 'needs_correction';\nEND;\n$$;\n\n-- Add RLS policies for correction functions\nCREATE POLICY \\"Admins can request corrections\\" ON public.companies\n  FOR UPDATE USING (\n    (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role))\n    AND status IN ('pending_verification', 'needs_correction')\n  );\n\nCREATE POLICY \\"Company members can submit corrections\\" ON public.companies  \n  FOR UPDATE USING (\n    id IN (\n      SELECT company_id FROM public.user_profiles \n      WHERE user_id = auth.uid()\n    ) AND status = 'needs_correction'\n  );"}		sarangrumah.dev@gmail.com	\N
\.


--
-- TOC entry 3760 (class 0 OID 16656)
-- Dependencies: 256
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 248
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 440, true);


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 272
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- TOC entry 4072 (class 2606 OID 16825)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4027 (class 2606 OID 16529)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4095 (class 2606 OID 16931)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4051 (class 2606 OID 16949)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4053 (class 2606 OID 16959)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4025 (class 2606 OID 16522)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4074 (class 2606 OID 16818)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4070 (class 2606 OID 16806)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4062 (class 2606 OID 16999)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4064 (class 2606 OID 16793)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4248 (class 2606 OID 49500)
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- TOC entry 4251 (class 2606 OID 49498)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4099 (class 2606 OID 16984)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4019 (class 2606 OID 16512)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4022 (class 2606 OID 16736)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4084 (class 2606 OID 16865)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4086 (class 2606 OID 16863)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4091 (class 2606 OID 16879)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4030 (class 2606 OID 16535)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4057 (class 2606 OID 16757)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4081 (class 2606 OID 16846)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4076 (class 2606 OID 16837)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4012 (class 2606 OID 16919)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4014 (class 2606 OID 16499)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4224 (class 2606 OID 46022)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4178 (class 2606 OID 18940)
-- Name: api_integration_logs api_integration_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_integration_logs
    ADD CONSTRAINT api_integration_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4220 (class 2606 OID 45994)
-- Name: application_documents application_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_documents
    ADD CONSTRAINT application_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4222 (class 2606 OID 46008)
-- Name: application_evaluations application_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_evaluations
    ADD CONSTRAINT application_evaluations_pkey PRIMARY KEY (id);


--
-- TOC entry 4245 (class 2606 OID 47256)
-- Name: application_workflow application_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_workflow
    ADD CONSTRAINT application_workflow_pkey PRIMARY KEY (id);


--
-- TOC entry 4176 (class 2606 OID 18923)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4234 (class 2606 OID 46091)
-- Name: captcha_sessions captcha_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.captcha_sessions
    ADD CONSTRAINT captcha_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4236 (class 2606 OID 46093)
-- Name: captcha_sessions captcha_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.captcha_sessions
    ADD CONSTRAINT captcha_sessions_session_token_key UNIQUE (session_token);


--
-- TOC entry 4204 (class 2606 OID 45933)
-- Name: companies companies_nib_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_nib_key UNIQUE (nib);


--
-- TOC entry 4206 (class 2606 OID 57380)
-- Name: companies companies_nib_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_nib_number_key UNIQUE (nib_number);


--
-- TOC entry 4208 (class 2606 OID 45931)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 4257 (class 2606 OID 57403)
-- Name: company_documents company_documents_company_id_document_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_company_id_document_type_key UNIQUE (company_id, document_type);


--
-- TOC entry 4259 (class 2606 OID 57401)
-- Name: company_documents company_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4129 (class 2606 OID 17347)
-- Name: faq_categories faq_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4131 (class 2606 OID 17358)
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- TOC entry 4188 (class 2606 OID 31253)
-- Name: fields fields_module_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_module_id_code_key UNIQUE (module_id, code);


--
-- TOC entry 4190 (class 2606 OID 31251)
-- Name: fields fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_pkey PRIMARY KEY (id);


--
-- TOC entry 4241 (class 2606 OID 47244)
-- Name: indonesian_regions indonesian_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indonesian_regions
    ADD CONSTRAINT indonesian_regions_pkey PRIMARY KEY (id);


--
-- TOC entry 4243 (class 2606 OID 47246)
-- Name: indonesian_regions indonesian_regions_region_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indonesian_regions
    ADD CONSTRAINT indonesian_regions_region_id_key UNIQUE (region_id);


--
-- TOC entry 4172 (class 2606 OID 18887)
-- Name: kabupaten kabupaten_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten
    ADD CONSTRAINT kabupaten_code_key UNIQUE (code);


--
-- TOC entry 4174 (class 2606 OID 18885)
-- Name: kabupaten kabupaten_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten
    ADD CONSTRAINT kabupaten_pkey PRIMARY KEY (id);


--
-- TOC entry 4216 (class 2606 OID 45975)
-- Name: license_applications license_applications_application_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_applications
    ADD CONSTRAINT license_applications_application_number_key UNIQUE (application_number);


--
-- TOC entry 4218 (class 2606 OID 45973)
-- Name: license_applications license_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_applications
    ADD CONSTRAINT license_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4214 (class 2606 OID 45962)
-- Name: license_services license_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_services
    ADD CONSTRAINT license_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4232 (class 2606 OID 46080)
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- TOC entry 4184 (class 2606 OID 31233)
-- Name: modules modules_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_code_key UNIQUE (code);


--
-- TOC entry 4186 (class 2606 OID 31231)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- TOC entry 4200 (class 2606 OID 31321)
-- Name: permission_templates permission_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_templates
    ADD CONSTRAINT permission_templates_name_key UNIQUE (name);


--
-- TOC entry 4202 (class 2606 OID 31319)
-- Name: permission_templates permission_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_templates
    ADD CONSTRAINT permission_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4192 (class 2606 OID 31274)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4194 (class 2606 OID 31276)
-- Name: permissions permissions_role_module_id_field_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_module_id_field_id_key UNIQUE (role, module_id, field_id);


--
-- TOC entry 4263 (class 2606 OID 57418)
-- Name: person_in_charge person_in_charge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_in_charge
    ADD CONSTRAINT person_in_charge_pkey PRIMARY KEY (id);


--
-- TOC entry 4266 (class 2606 OID 57446)
-- Name: pic_documents pic_documents_pic_id_document_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pic_documents
    ADD CONSTRAINT pic_documents_pic_id_document_type_key UNIQUE (pic_id, document_type);


--
-- TOC entry 4268 (class 2606 OID 57444)
-- Name: pic_documents pic_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pic_documents
    ADD CONSTRAINT pic_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4121 (class 2606 OID 17317)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4123 (class 2606 OID 17319)
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 4167 (class 2606 OID 18874)
-- Name: provinces provinces_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_code_key UNIQUE (code);


--
-- TOC entry 4169 (class 2606 OID 18872)
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- TOC entry 4196 (class 2606 OID 31300)
-- Name: record_permissions record_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.record_permissions
    ADD CONSTRAINT record_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4198 (class 2606 OID 31302)
-- Name: record_permissions record_permissions_table_name_record_id_user_id_permission__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.record_permissions
    ADD CONSTRAINT record_permissions_table_name_record_id_user_id_permission__key UNIQUE (table_name, record_id, user_id, permission_type);


--
-- TOC entry 4156 (class 2606 OID 18832)
-- Name: services services_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_code_key UNIQUE (code);


--
-- TOC entry 4158 (class 2606 OID 18830)
-- Name: services services_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_name_key UNIQUE (name);


--
-- TOC entry 4160 (class 2606 OID 18828)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 4163 (class 2606 OID 18842)
-- Name: sub_services sub_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_services
    ADD CONSTRAINT sub_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4165 (class 2606 OID 18844)
-- Name: sub_services sub_services_service_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_services
    ADD CONSTRAINT sub_services_service_id_code_key UNIQUE (service_id, code);


--
-- TOC entry 4226 (class 2606 OID 46034)
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4228 (class 2606 OID 46036)
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- TOC entry 4139 (class 2606 OID 17396)
-- Name: telekom_data telekom_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telekom_data
    ADD CONSTRAINT telekom_data_pkey PRIMARY KEY (id);


--
-- TOC entry 4150 (class 2606 OID 17620)
-- Name: ticket_assignments ticket_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT ticket_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4148 (class 2606 OID 17564)
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4152 (class 2606 OID 17645)
-- Name: ticket_sla_metrics ticket_sla_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_sla_metrics
    ADD CONSTRAINT ticket_sla_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 4133 (class 2606 OID 17377)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4230 (class 2606 OID 46052)
-- Name: ulo_applications ulo_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulo_applications
    ADD CONSTRAINT ulo_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4154 (class 2606 OID 17660)
-- Name: ticket_sla_metrics unique_ticket_sla_metrics; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_sla_metrics
    ADD CONSTRAINT unique_ticket_sla_metrics UNIQUE (ticket_id);


--
-- TOC entry 4212 (class 2606 OID 45946)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4125 (class 2606 OID 17331)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4127 (class 2606 OID 17333)
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- TOC entry 4110 (class 2606 OID 17206)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4253 (class 2606 OID 57336)
-- Name: messages_2025_09_11 messages_2025_09_11_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_11
    ADD CONSTRAINT messages_2025_09_11_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4255 (class 2606 OID 57347)
-- Name: messages_2025_09_12 messages_2025_09_12_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_12
    ADD CONSTRAINT messages_2025_09_12_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4270 (class 2606 OID 57497)
-- Name: messages_2025_09_13 messages_2025_09_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_13
    ADD CONSTRAINT messages_2025_09_13_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4272 (class 2606 OID 58645)
-- Name: messages_2025_09_14 messages_2025_09_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_14
    ADD CONSTRAINT messages_2025_09_14_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4274 (class 2606 OID 59761)
-- Name: messages_2025_09_15 messages_2025_09_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_15
    ADD CONSTRAINT messages_2025_09_15_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4276 (class 2606 OID 60877)
-- Name: messages_2025_09_16 messages_2025_09_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_16
    ADD CONSTRAINT messages_2025_09_16_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4278 (class 2606 OID 63096)
-- Name: messages_2025_09_17 messages_2025_09_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_17
    ADD CONSTRAINT messages_2025_09_17_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4107 (class 2606 OID 17031)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4104 (class 2606 OID 17004)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4144 (class 2606 OID 17548)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4033 (class 2606 OID 16552)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4043 (class 2606 OID 16593)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4045 (class 2606 OID 16591)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4041 (class 2606 OID 16569)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4142 (class 2606 OID 17502)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 4115 (class 2606 OID 17234)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4113 (class 2606 OID 17219)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4117 (class 2606 OID 17277)
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- TOC entry 4119 (class 2606 OID 17275)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4028 (class 1259 OID 16530)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4002 (class 1259 OID 16746)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4003 (class 1259 OID 16748)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4004 (class 1259 OID 16749)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4060 (class 1259 OID 16827)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4093 (class 1259 OID 16935)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4049 (class 1259 OID 16915)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 4049
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4054 (class 1259 OID 16743)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4096 (class 1259 OID 16932)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4097 (class 1259 OID 16933)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4068 (class 1259 OID 16938)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4065 (class 1259 OID 16799)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4066 (class 1259 OID 16944)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4246 (class 1259 OID 49501)
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- TOC entry 4249 (class 1259 OID 49502)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4100 (class 1259 OID 16991)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4101 (class 1259 OID 16990)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4102 (class 1259 OID 16992)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4005 (class 1259 OID 16750)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4006 (class 1259 OID 16747)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4015 (class 1259 OID 16513)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4016 (class 1259 OID 16514)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4017 (class 1259 OID 16742)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4020 (class 1259 OID 16829)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4023 (class 1259 OID 16934)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4087 (class 1259 OID 16871)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4088 (class 1259 OID 16936)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4089 (class 1259 OID 16886)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4092 (class 1259 OID 16885)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4055 (class 1259 OID 16937)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4058 (class 1259 OID 16828)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4079 (class 1259 OID 16853)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4082 (class 1259 OID 16852)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4077 (class 1259 OID 16838)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4078 (class 1259 OID 32462)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4067 (class 1259 OID 16997)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4059 (class 1259 OID 16826)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4007 (class 1259 OID 16906)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 4007
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4008 (class 1259 OID 16744)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4009 (class 1259 OID 16503)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4010 (class 1259 OID 16961)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4179 (class 1259 OID 18950)
-- Name: idx_api_integration_logs_api_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_integration_logs_api_name ON public.api_integration_logs USING btree (api_name);


--
-- TOC entry 4180 (class 1259 OID 18952)
-- Name: idx_api_integration_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_integration_logs_created_at ON public.api_integration_logs USING btree (created_at);


--
-- TOC entry 4181 (class 1259 OID 18951)
-- Name: idx_api_integration_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_integration_logs_status ON public.api_integration_logs USING btree (status);


--
-- TOC entry 4182 (class 1259 OID 18949)
-- Name: idx_api_integration_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_integration_logs_user_id ON public.api_integration_logs USING btree (user_id);


--
-- TOC entry 4209 (class 1259 OID 57466)
-- Name: idx_companies_nib_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_nib_number ON public.companies USING btree (nib_number);


--
-- TOC entry 4210 (class 1259 OID 57467)
-- Name: idx_companies_npwp_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_npwp_number ON public.companies USING btree (npwp_number);


--
-- TOC entry 4260 (class 1259 OID 57463)
-- Name: idx_company_documents_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_documents_company_id ON public.company_documents USING btree (company_id);


--
-- TOC entry 4170 (class 1259 OID 18907)
-- Name: idx_kabupaten_province_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kabupaten_province_id ON public.kabupaten USING btree (province_id);


--
-- TOC entry 4261 (class 1259 OID 57464)
-- Name: idx_person_in_charge_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_person_in_charge_company_id ON public.person_in_charge USING btree (company_id);


--
-- TOC entry 4264 (class 1259 OID 57465)
-- Name: idx_pic_documents_pic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pic_documents_pic_id ON public.pic_documents USING btree (pic_id);


--
-- TOC entry 4237 (class 1259 OID 47264)
-- Name: idx_regions_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_name ON public.indonesian_regions USING btree (name);


--
-- TOC entry 4238 (class 1259 OID 47262)
-- Name: idx_regions_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_parent_id ON public.indonesian_regions USING btree (parent_id);


--
-- TOC entry 4239 (class 1259 OID 47263)
-- Name: idx_regions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_type ON public.indonesian_regions USING btree (type);


--
-- TOC entry 4161 (class 1259 OID 18859)
-- Name: idx_sub_services_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sub_services_service_id ON public.sub_services USING btree (service_id);


--
-- TOC entry 4134 (class 1259 OID 18909)
-- Name: idx_telekom_data_kabupaten_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telekom_data_kabupaten_id ON public.telekom_data USING btree (kabupaten_id);


--
-- TOC entry 4135 (class 1259 OID 18908)
-- Name: idx_telekom_data_province_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telekom_data_province_id ON public.telekom_data USING btree (province_id);


--
-- TOC entry 4136 (class 1259 OID 18860)
-- Name: idx_telekom_data_sub_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telekom_data_sub_service_id ON public.telekom_data USING btree (sub_service_id);


--
-- TOC entry 4137 (class 1259 OID 18778)
-- Name: idx_telekom_data_sub_service_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telekom_data_sub_service_type ON public.telekom_data USING btree (sub_service_type);


--
-- TOC entry 4145 (class 1259 OID 17577)
-- Name: idx_ticket_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages USING btree (created_at DESC);


--
-- TOC entry 4146 (class 1259 OID 17576)
-- Name: idx_ticket_messages_ticket_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages USING btree (ticket_id);


--
-- TOC entry 4105 (class 1259 OID 17208)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4108 (class 1259 OID 17080)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4031 (class 1259 OID 16558)
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4034 (class 1259 OID 16580)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 4111 (class 1259 OID 17245)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4035 (class 1259 OID 17520)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 4036 (class 1259 OID 17210)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4037 (class 1259 OID 17522)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 4140 (class 1259 OID 17523)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 4038 (class 1259 OID 16581)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4039 (class 1259 OID 17521)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 4279 (class 0 OID 0)
-- Name: messages_2025_09_11_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_11_pkey;


--
-- TOC entry 4280 (class 0 OID 0)
-- Name: messages_2025_09_12_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_12_pkey;


--
-- TOC entry 4281 (class 0 OID 0)
-- Name: messages_2025_09_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_13_pkey;


--
-- TOC entry 4282 (class 0 OID 0)
-- Name: messages_2025_09_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_14_pkey;


--
-- TOC entry 4283 (class 0 OID 0)
-- Name: messages_2025_09_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_15_pkey;


--
-- TOC entry 4284 (class 0 OID 0)
-- Name: messages_2025_09_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_16_pkey;


--
-- TOC entry 4285 (class 0 OID 0)
-- Name: messages_2025_09_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_17_pkey;


--
-- TOC entry 4341 (class 2620 OID 17421)
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- TOC entry 4364 (class 2620 OID 18954)
-- Name: api_integration_logs api_integration_logs_audit_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER api_integration_logs_audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.api_integration_logs FOR EACH ROW EXECUTE FUNCTION public.log_changes();


--
-- TOC entry 4354 (class 2620 OID 18926)
-- Name: telekom_data audit_telekom_data_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_telekom_data_changes AFTER INSERT OR DELETE OR UPDATE ON public.telekom_data FOR EACH ROW EXECUTE FUNCTION public.log_changes();


--
-- TOC entry 4351 (class 2620 OID 18928)
-- Name: tickets audit_tickets_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_tickets_changes AFTER INSERT OR DELETE OR UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.log_changes();


--
-- TOC entry 4349 (class 2620 OID 18927)
-- Name: user_roles audit_user_roles_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_user_roles_changes AFTER INSERT OR DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_changes();


--
-- TOC entry 4365 (class 2620 OID 18953)
-- Name: api_integration_logs update_api_integration_logs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_api_integration_logs_updated_at BEFORE UPDATE ON public.api_integration_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4370 (class 2620 OID 46065)
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4376 (class 2620 OID 57460)
-- Name: company_documents update_company_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_company_documents_updated_at BEFORE UPDATE ON public.company_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4350 (class 2620 OID 17424)
-- Name: faqs update_faqs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4367 (class 2620 OID 31338)
-- Name: fields update_fields_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4363 (class 2620 OID 18911)
-- Name: kabupaten update_kabupaten_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_kabupaten_updated_at BEFORE UPDATE ON public.kabupaten FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4373 (class 2620 OID 46068)
-- Name: license_applications update_license_applications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_license_applications_updated_at BEFORE UPDATE ON public.license_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4372 (class 2620 OID 46067)
-- Name: license_services update_license_services_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_license_services_updated_at BEFORE UPDATE ON public.license_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4366 (class 2620 OID 31337)
-- Name: modules update_modules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4369 (class 2620 OID 31340)
-- Name: permission_templates update_permission_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_permission_templates_updated_at BEFORE UPDATE ON public.permission_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4368 (class 2620 OID 31339)
-- Name: permissions update_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4377 (class 2620 OID 57461)
-- Name: person_in_charge update_person_in_charge_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_person_in_charge_updated_at BEFORE UPDATE ON public.person_in_charge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4378 (class 2620 OID 57462)
-- Name: pic_documents update_pic_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_pic_documents_updated_at BEFORE UPDATE ON public.pic_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4348 (class 2620 OID 17423)
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4362 (class 2620 OID 18910)
-- Name: provinces update_provinces_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_provinces_updated_at BEFORE UPDATE ON public.provinces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4360 (class 2620 OID 18861)
-- Name: services update_services_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4358 (class 2620 OID 17656)
-- Name: ticket_messages update_sla_metrics_on_message; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sla_metrics_on_message AFTER INSERT ON public.ticket_messages FOR EACH ROW EXECUTE FUNCTION public.calculate_sla_metrics();


--
-- TOC entry 4352 (class 2620 OID 17657)
-- Name: tickets update_sla_metrics_on_status_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sla_metrics_on_status_change AFTER UPDATE OF status ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.calculate_sla_metrics();


--
-- TOC entry 4361 (class 2620 OID 18862)
-- Name: sub_services update_sub_services_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sub_services_updated_at BEFORE UPDATE ON public.sub_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4374 (class 2620 OID 46069)
-- Name: support_tickets update_support_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4355 (class 2620 OID 17426)
-- Name: telekom_data update_telekom_data_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_telekom_data_updated_at BEFORE UPDATE ON public.telekom_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4359 (class 2620 OID 17575)
-- Name: ticket_messages update_ticket_messages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_ticket_messages_updated_at BEFORE UPDATE ON public.ticket_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4353 (class 2620 OID 17425)
-- Name: tickets update_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4375 (class 2620 OID 46070)
-- Name: ulo_applications update_ulo_applications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_ulo_applications_updated_at BEFORE UPDATE ON public.ulo_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4371 (class 2620 OID 46066)
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4347 (class 2620 OID 17036)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 4342 (class 2620 OID 17530)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 4343 (class 2620 OID 17518)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4344 (class 2620 OID 17516)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 4345 (class 2620 OID 17517)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 4356 (class 2620 OID 17526)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 4357 (class 2620 OID 17515)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4346 (class 2620 OID 17192)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 4288 (class 2606 OID 16730)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4292 (class 2606 OID 16819)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4291 (class 2606 OID 16807)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4290 (class 2606 OID 16794)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4297 (class 2606 OID 16985)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4286 (class 2606 OID 16763)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4294 (class 2606 OID 16866)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4295 (class 2606 OID 16939)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4296 (class 2606 OID 16880)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4289 (class 2606 OID 16758)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4293 (class 2606 OID 16847)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4318 (class 2606 OID 18941)
-- Name: api_integration_logs api_integration_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_integration_logs
    ADD CONSTRAINT api_integration_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 4331 (class 2606 OID 45995)
-- Name: application_documents application_documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_documents
    ADD CONSTRAINT application_documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.license_applications(id);


--
-- TOC entry 4332 (class 2606 OID 46009)
-- Name: application_evaluations application_evaluations_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_evaluations
    ADD CONSTRAINT application_evaluations_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.license_applications(id);


--
-- TOC entry 4335 (class 2606 OID 47257)
-- Name: application_workflow application_workflow_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_workflow
    ADD CONSTRAINT application_workflow_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.license_applications(id) ON DELETE CASCADE;


--
-- TOC entry 4326 (class 2606 OID 57386)
-- Name: companies companies_kabupaten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_kabupaten_id_fkey FOREIGN KEY (kabupaten_id) REFERENCES public.kabupaten(id);


--
-- TOC entry 4327 (class 2606 OID 57381)
-- Name: companies companies_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 4336 (class 2606 OID 57404)
-- Name: company_documents company_documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4303 (class 2606 OID 17359)
-- Name: faqs faqs_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.faq_categories(id) ON DELETE SET NULL;


--
-- TOC entry 4320 (class 2606 OID 31254)
-- Name: fields fields_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- TOC entry 4317 (class 2606 OID 18888)
-- Name: kabupaten kabupaten_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten
    ADD CONSTRAINT kabupaten_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 4329 (class 2606 OID 45976)
-- Name: license_applications license_applications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_applications
    ADD CONSTRAINT license_applications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4330 (class 2606 OID 45981)
-- Name: license_applications license_applications_license_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_applications
    ADD CONSTRAINT license_applications_license_service_id_fkey FOREIGN KEY (license_service_id) REFERENCES public.license_services(id);


--
-- TOC entry 4319 (class 2606 OID 31234)
-- Name: modules modules_parent_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_parent_module_id_fkey FOREIGN KEY (parent_module_id) REFERENCES public.modules(id);


--
-- TOC entry 4325 (class 2606 OID 31322)
-- Name: permission_templates permission_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_templates
    ADD CONSTRAINT permission_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- TOC entry 4321 (class 2606 OID 31287)
-- Name: permissions permissions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- TOC entry 4322 (class 2606 OID 31282)
-- Name: permissions permissions_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE CASCADE;


--
-- TOC entry 4323 (class 2606 OID 31277)
-- Name: permissions permissions_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- TOC entry 4337 (class 2606 OID 57419)
-- Name: person_in_charge person_in_charge_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_in_charge
    ADD CONSTRAINT person_in_charge_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4338 (class 2606 OID 57429)
-- Name: person_in_charge person_in_charge_kabupaten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_in_charge
    ADD CONSTRAINT person_in_charge_kabupaten_id_fkey FOREIGN KEY (kabupaten_id) REFERENCES public.kabupaten(id);


--
-- TOC entry 4339 (class 2606 OID 57424)
-- Name: person_in_charge person_in_charge_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_in_charge
    ADD CONSTRAINT person_in_charge_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 4340 (class 2606 OID 57447)
-- Name: pic_documents pic_documents_pic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pic_documents
    ADD CONSTRAINT pic_documents_pic_id_fkey FOREIGN KEY (pic_id) REFERENCES public.person_in_charge(id) ON DELETE CASCADE;


--
-- TOC entry 4301 (class 2606 OID 17320)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4324 (class 2606 OID 31303)
-- Name: record_permissions record_permissions_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.record_permissions
    ADD CONSTRAINT record_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id);


--
-- TOC entry 4316 (class 2606 OID 18845)
-- Name: sub_services sub_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_services
    ADD CONSTRAINT sub_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 4333 (class 2606 OID 46037)
-- Name: support_tickets support_tickets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4306 (class 2606 OID 17397)
-- Name: telekom_data telekom_data_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telekom_data
    ADD CONSTRAINT telekom_data_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- TOC entry 4307 (class 2606 OID 18902)
-- Name: telekom_data telekom_data_kabupaten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telekom_data
    ADD CONSTRAINT telekom_data_kabupaten_id_fkey FOREIGN KEY (kabupaten_id) REFERENCES public.kabupaten(id);


--
-- TOC entry 4308 (class 2606 OID 18897)
-- Name: telekom_data telekom_data_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telekom_data
    ADD CONSTRAINT telekom_data_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 4309 (class 2606 OID 18854)
-- Name: telekom_data telekom_data_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telekom_data
    ADD CONSTRAINT telekom_data_sub_service_id_fkey FOREIGN KEY (sub_service_id) REFERENCES public.sub_services(id);


--
-- TOC entry 4312 (class 2606 OID 17626)
-- Name: ticket_assignments ticket_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT ticket_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);


--
-- TOC entry 4313 (class 2606 OID 17631)
-- Name: ticket_assignments ticket_assignments_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT ticket_assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- TOC entry 4314 (class 2606 OID 17621)
-- Name: ticket_assignments ticket_assignments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT ticket_assignments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 4311 (class 2606 OID 17565)
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 4315 (class 2606 OID 17646)
-- Name: ticket_sla_metrics ticket_sla_metrics_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_sla_metrics
    ADD CONSTRAINT ticket_sla_metrics_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 4304 (class 2606 OID 17606)
-- Name: tickets tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- TOC entry 4305 (class 2606 OID 17378)
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4334 (class 2606 OID 46053)
-- Name: ulo_applications ulo_applications_license_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulo_applications
    ADD CONSTRAINT ulo_applications_license_application_id_fkey FOREIGN KEY (license_application_id) REFERENCES public.license_applications(id);


--
-- TOC entry 4328 (class 2606 OID 45947)
-- Name: user_profiles user_profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4302 (class 2606 OID 17334)
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4287 (class 2606 OID 16570)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4310 (class 2606 OID 17503)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4298 (class 2606 OID 17220)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4299 (class 2606 OID 17240)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4300 (class 2606 OID 17235)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 4530 (class 0 OID 16523)
-- Dependencies: 251
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4544 (class 0 OID 16925)
-- Dependencies: 268
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4535 (class 0 OID 16723)
-- Dependencies: 259
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4529 (class 0 OID 16516)
-- Dependencies: 250
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4539 (class 0 OID 16812)
-- Dependencies: 263
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4538 (class 0 OID 16800)
-- Dependencies: 262
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4537 (class 0 OID 16787)
-- Dependencies: 261
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4545 (class 0 OID 16975)
-- Dependencies: 269
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4528 (class 0 OID 16505)
-- Dependencies: 249
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4542 (class 0 OID 16854)
-- Dependencies: 266
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4543 (class 0 OID 16872)
-- Dependencies: 267
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4531 (class 0 OID 16531)
-- Dependencies: 252
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4536 (class 0 OID 16753)
-- Dependencies: 260
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4541 (class 0 OID 16839)
-- Dependencies: 265
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4540 (class 0 OID 16830)
-- Dependencies: 264
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4527 (class 0 OID 16493)
-- Dependencies: 247
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4679 (class 3256 OID 57519)
-- Name: companies Admins can call company management functions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can call company management functions" ON public.companies TO authenticated USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4617 (class 3256 OID 17573)
-- Name: ticket_messages Admins can create messages on any ticket; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create messages on any ticket" ON public.ticket_messages FOR INSERT WITH CHECK (((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)) AND (user_id = auth.uid())));


--
-- TOC entry 4596 (class 3256 OID 17412)
-- Name: faq_categories Admins can manage FAQ categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage FAQ categories" ON public.faq_categories USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4594 (class 3256 OID 17410)
-- Name: faqs Admins can manage FAQs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage FAQs" ON public.faqs USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4622 (class 3256 OID 17654)
-- Name: ticket_sla_metrics Admins can manage SLA metrics; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage SLA metrics" ON public.ticket_sla_metrics USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4674 (class 3256 OID 57479)
-- Name: pic_documents Admins can manage all PIC documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all PIC documents" ON public.pic_documents USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4673 (class 3256 OID 57478)
-- Name: person_in_charge Admins can manage all PIC records; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all PIC records" ON public.person_in_charge USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4672 (class 3256 OID 57477)
-- Name: company_documents Admins can manage all company documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all company documents" ON public.company_documents USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4592 (class 3256 OID 17408)
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4602 (class 3256 OID 17419)
-- Name: telekom_data Admins can manage all telekom data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all telekom data" ON public.telekom_data USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4638 (class 3256 OID 31329)
-- Name: fields Admins can manage fields; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage fields" ON public.fields USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4630 (class 3256 OID 18896)
-- Name: kabupaten Admins can manage kabupaten; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage kabupaten" ON public.kabupaten USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4636 (class 3256 OID 31327)
-- Name: modules Admins can manage modules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage modules" ON public.modules USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4643 (class 3256 OID 31335)
-- Name: permission_templates Admins can manage permission templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage permission templates" ON public.permission_templates USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4640 (class 3256 OID 31331)
-- Name: permissions Admins can manage permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage permissions" ON public.permissions USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4628 (class 3256 OID 18894)
-- Name: provinces Admins can manage provinces; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage provinces" ON public.provinces USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4642 (class 3256 OID 31333)
-- Name: record_permissions Admins can manage record permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage record permissions" ON public.record_permissions USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4624 (class 3256 OID 18851)
-- Name: services Admins can manage services; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage services" ON public.services USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4626 (class 3256 OID 18853)
-- Name: sub_services Admins can manage sub_services; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage sub_services" ON public.sub_services USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4620 (class 3256 OID 17652)
-- Name: ticket_assignments Admins can manage ticket assignments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage ticket assignments" ON public.ticket_assignments USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4680 (class 3256 OID 58635)
-- Name: companies Admins can request corrections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can request corrections" ON public.companies FOR UPDATE USING (((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)) AND (status = ANY (ARRAY['pending_verification'::public.company_status, 'needs_correction'::public.company_status]))));


--
-- TOC entry 4618 (class 3256 OID 17574)
-- Name: ticket_messages Admins can update ticket messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update ticket messages" ON public.ticket_messages FOR UPDATE USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4600 (class 3256 OID 17416)
-- Name: tickets Admins can update tickets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update tickets" ON public.tickets FOR UPDATE USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4635 (class 3256 OID 18948)
-- Name: api_integration_logs Admins can view all API logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all API logs" ON public.api_integration_logs FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4621 (class 3256 OID 17653)
-- Name: ticket_sla_metrics Admins can view all SLA metrics; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all SLA metrics" ON public.ticket_sla_metrics FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4590 (class 3256 OID 17406)
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4619 (class 3256 OID 17651)
-- Name: ticket_assignments Admins can view all ticket assignments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all ticket assignments" ON public.ticket_assignments FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4616 (class 3256 OID 17572)
-- Name: ticket_messages Admins can view all ticket messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all ticket messages" ON public.ticket_messages FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4599 (class 3256 OID 17415)
-- Name: tickets Admins can view all tickets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all tickets" ON public.tickets FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role)));


--
-- TOC entry 4631 (class 3256 OID 18924)
-- Name: audit_logs Admins can view audit logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING ((public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role)));


--
-- TOC entry 4595 (class 3256 OID 17411)
-- Name: faq_categories Anyone can view FAQ categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view FAQ categories" ON public.faq_categories FOR SELECT USING (true);


--
-- TOC entry 4593 (class 3256 OID 17409)
-- Name: faqs Anyone can view active FAQs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active FAQs" ON public.faqs FOR SELECT USING ((is_active = true));


--
-- TOC entry 4675 (class 3256 OID 57503)
-- Name: indonesian_regions Anyone can view indonesian regions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view indonesian regions" ON public.indonesian_regions FOR SELECT USING (true);


--
-- TOC entry 4629 (class 3256 OID 18895)
-- Name: kabupaten Anyone can view kabupaten; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view kabupaten" ON public.kabupaten FOR SELECT USING (true);


--
-- TOC entry 4627 (class 3256 OID 18893)
-- Name: provinces Anyone can view provinces; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view provinces" ON public.provinces FOR SELECT USING (true);


--
-- TOC entry 4623 (class 3256 OID 18850)
-- Name: services Anyone can view services; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);


--
-- TOC entry 4625 (class 3256 OID 18852)
-- Name: sub_services Anyone can view sub_services; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view sub_services" ON public.sub_services FOR SELECT USING (true);


--
-- TOC entry 4645 (class 3256 OID 45934)
-- Name: companies Authenticated users can insert companies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- TOC entry 4657 (class 3256 OID 46098)
-- Name: captcha_sessions Captcha sessions are publicly readable for verification; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Captcha sessions are publicly readable for verification" ON public.captcha_sessions FOR SELECT USING (((NOT used) AND (expires_at > now())));


--
-- TOC entry 4670 (class 3256 OID 57474)
-- Name: pic_documents Company admins can delete PIC documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can delete PIC documents" ON public.pic_documents FOR DELETE USING ((pic_id IN ( SELECT pic.id
   FROM (public.person_in_charge pic
     JOIN public.user_profiles up ON ((pic.company_id = up.company_id)))
  WHERE ((up.user_id = auth.uid()) AND (up.is_company_admin = true)))));


--
-- TOC entry 4668 (class 3256 OID 57471)
-- Name: company_documents Company admins can delete their company documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can delete their company documents" ON public.company_documents FOR DELETE USING ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.is_company_admin = true)))));


--
-- TOC entry 4671 (class 3256 OID 57476)
-- Name: person_in_charge Company admins can insert PIC; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can insert PIC" ON public.person_in_charge FOR INSERT WITH CHECK ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.is_company_admin = true)))));


--
-- TOC entry 4666 (class 3256 OID 57458)
-- Name: pic_documents Company admins can insert PIC documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can insert PIC documents" ON public.pic_documents FOR INSERT WITH CHECK (((pic_id IN ( SELECT pic.id
   FROM (public.person_in_charge pic
     JOIN public.user_profiles up ON ((pic.company_id = up.company_id)))
  WHERE ((up.user_id = auth.uid()) AND (up.is_company_admin = true)))) AND (uploaded_by = auth.uid())));


--
-- TOC entry 4652 (class 3256 OID 46064)
-- Name: license_applications Company admins can insert applications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can insert applications" ON public.license_applications FOR INSERT WITH CHECK ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.is_company_admin = true)))));


--
-- TOC entry 4662 (class 3256 OID 57453)
-- Name: company_documents Company admins can insert documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can insert documents" ON public.company_documents FOR INSERT WITH CHECK (((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.is_company_admin = true)))) AND (uploaded_by = auth.uid())));


--
-- TOC entry 4664 (class 3256 OID 57455)
-- Name: person_in_charge Company admins can manage PIC; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can manage PIC" ON public.person_in_charge USING ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.is_company_admin = true)))));


--
-- TOC entry 4669 (class 3256 OID 57472)
-- Name: pic_documents Company admins can update PIC documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can update PIC documents" ON public.pic_documents FOR UPDATE USING ((pic_id IN ( SELECT pic.id
   FROM (public.person_in_charge pic
     JOIN public.user_profiles up ON ((pic.company_id = up.company_id)))
  WHERE ((up.user_id = auth.uid()) AND (up.is_company_admin = true)))));


--
-- TOC entry 4667 (class 3256 OID 57470)
-- Name: company_documents Company admins can update their company documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company admins can update their company documents" ON public.company_documents FOR UPDATE USING ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.is_company_admin = true)))));


--
-- TOC entry 4681 (class 3256 OID 58636)
-- Name: companies Company members can submit corrections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company members can submit corrections" ON public.companies FOR UPDATE USING (((id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE (user_profiles.user_id = auth.uid()))) AND (status = 'needs_correction'::public.company_status)));


--
-- TOC entry 4649 (class 3256 OID 46061)
-- Name: companies Company members can view their company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Company members can view their company" ON public.companies FOR SELECT USING ((id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE (user_profiles.user_id = auth.uid()))));


--
-- TOC entry 4658 (class 3256 OID 47271)
-- Name: captcha_sessions Enable public captcha operations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable public captcha operations" ON public.captcha_sessions USING (true) WITH CHECK (true);


--
-- TOC entry 4639 (class 3256 OID 31330)
-- Name: fields Everyone can view active fields; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view active fields" ON public.fields FOR SELECT USING ((is_active = true));


--
-- TOC entry 4637 (class 3256 OID 31328)
-- Name: modules Everyone can view active modules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view active modules" ON public.modules FOR SELECT USING ((is_active = true));


--
-- TOC entry 4644 (class 3256 OID 31336)
-- Name: permission_templates Everyone can view active permission templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view active permission templates" ON public.permission_templates FOR SELECT USING ((is_active = true));


--
-- TOC entry 4650 (class 3256 OID 46062)
-- Name: license_services License services are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "License services are viewable by authenticated users" ON public.license_services FOR SELECT TO authenticated USING ((is_active = true));


--
-- TOC entry 4601 (class 3256 OID 17418)
-- Name: telekom_data Pelaku usaha can insert their own data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Pelaku usaha can insert their own data" ON public.telekom_data FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'pelaku_usaha'::public.app_role) AND (auth.uid() = created_by)));


--
-- TOC entry 4660 (class 3256 OID 57352)
-- Name: telekom_data Public limited search access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public limited search access" ON public.telekom_data FOR SELECT USING (
CASE
    WHEN (auth.uid() IS NOT NULL) THEN (EXISTS ( SELECT 1
       FROM public.profiles
      WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true))))
    ELSE true
END);


--
-- TOC entry 4615 (class 3256 OID 17571)
-- Name: ticket_messages Users can create messages for their own tickets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create messages for their own tickets" ON public.ticket_messages FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_messages.ticket_id) AND (tickets.user_id = auth.uid())))) AND (user_id = auth.uid())));


--
-- TOC entry 4633 (class 3256 OID 18947)
-- Name: api_integration_logs Users can create their own API logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own API logs" ON public.api_integration_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 4598 (class 3256 OID 17414)
-- Name: tickets Users can create tickets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 4589 (class 3256 OID 17405)
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 4648 (class 3256 OID 46060)
-- Name: user_profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 4588 (class 3256 OID 17404)
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- TOC entry 4647 (class 3256 OID 46059)
-- Name: user_profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- TOC entry 4665 (class 3256 OID 57456)
-- Name: pic_documents Users can view PIC documents from their company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view PIC documents from their company" ON public.pic_documents FOR SELECT USING ((pic_id IN ( SELECT pic.id
   FROM (public.person_in_charge pic
     JOIN public.user_profiles up ON ((pic.company_id = up.company_id)))
  WHERE (up.user_id = auth.uid()))));


--
-- TOC entry 4663 (class 3256 OID 57454)
-- Name: person_in_charge Users can view PIC from their company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view PIC from their company" ON public.person_in_charge FOR SELECT USING ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE (user_profiles.user_id = auth.uid()))));


--
-- TOC entry 4651 (class 3256 OID 46063)
-- Name: license_applications Users can view applications from their company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view applications from their company" ON public.license_applications FOR SELECT USING ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE (user_profiles.user_id = auth.uid()))));


--
-- TOC entry 4661 (class 3256 OID 57452)
-- Name: company_documents Users can view documents from their company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view documents from their company" ON public.company_documents FOR SELECT USING ((company_id IN ( SELECT user_profiles.company_id
   FROM public.user_profiles
  WHERE (user_profiles.user_id = auth.uid()))));


--
-- TOC entry 4614 (class 3256 OID 17570)
-- Name: ticket_messages Users can view messages for their own tickets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view messages for their own tickets" ON public.ticket_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_messages.ticket_id) AND (tickets.user_id = auth.uid())))));


--
-- TOC entry 4641 (class 3256 OID 31332)
-- Name: permissions Users can view permissions for their role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view permissions for their role" ON public.permissions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = permissions.role)))));


--
-- TOC entry 4632 (class 3256 OID 18946)
-- Name: api_integration_logs Users can view their own API logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own API logs" ON public.api_integration_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- TOC entry 4656 (class 3256 OID 46097)
-- Name: login_attempts Users can view their own login attempts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own login attempts" ON public.login_attempts FOR SELECT USING (true);


--
-- TOC entry 4587 (class 3256 OID 17403)
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- TOC entry 4646 (class 3256 OID 46058)
-- Name: user_profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- TOC entry 4634 (class 3256 OID 31334)
-- Name: record_permissions Users can view their own record permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own record permissions" ON public.record_permissions FOR SELECT USING ((user_id = auth.uid()));


--
-- TOC entry 4591 (class 3256 OID 17407)
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- TOC entry 4597 (class 3256 OID 17413)
-- Name: tickets Users can view their own tickets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT USING ((auth.uid() = user_id));


--
-- TOC entry 4659 (class 3256 OID 57351)
-- Name: telekom_data Validated users can view full telekom data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Validated users can view full telekom data" ON public.telekom_data FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true)))));


--
-- TOC entry 4577 (class 0 OID 46014)
-- Dependencies: 308
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4565 (class 0 OID 18930)
-- Dependencies: 296
-- Name: api_integration_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.api_integration_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4575 (class 0 OID 45986)
-- Dependencies: 306
-- Name: application_documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4576 (class 0 OID 46000)
-- Dependencies: 307
-- Name: application_evaluations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.application_evaluations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4583 (class 0 OID 47247)
-- Dependencies: 314
-- Name: application_workflow; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.application_workflow ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4564 (class 0 OID 18915)
-- Dependencies: 295
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4581 (class 0 OID 46081)
-- Dependencies: 312
-- Name: captcha_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.captcha_sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4571 (class 0 OID 45921)
-- Dependencies: 302
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4584 (class 0 OID 57391)
-- Dependencies: 318
-- Name: company_documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4551 (class 0 OID 17339)
-- Dependencies: 282
-- Name: faq_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4552 (class 0 OID 17348)
-- Dependencies: 283
-- Name: faqs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4567 (class 0 OID 31239)
-- Dependencies: 298
-- Name: fields; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4582 (class 0 OID 47236)
-- Dependencies: 313
-- Name: indonesian_regions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.indonesian_regions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4563 (class 0 OID 18875)
-- Dependencies: 294
-- Name: kabupaten; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.kabupaten ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4574 (class 0 OID 45963)
-- Dependencies: 305
-- Name: license_applications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.license_applications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4573 (class 0 OID 45952)
-- Dependencies: 304
-- Name: license_services; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.license_services ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4580 (class 0 OID 46071)
-- Dependencies: 311
-- Name: login_attempts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4566 (class 0 OID 31221)
-- Dependencies: 297
-- Name: modules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4570 (class 0 OID 31308)
-- Dependencies: 301
-- Name: permission_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4568 (class 0 OID 31259)
-- Dependencies: 299
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4585 (class 0 OID 57409)
-- Dependencies: 319
-- Name: person_in_charge; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.person_in_charge ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4586 (class 0 OID 57434)
-- Dependencies: 320
-- Name: pic_documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pic_documents ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4549 (class 0 OID 17307)
-- Dependencies: 280
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4562 (class 0 OID 18863)
-- Dependencies: 293
-- Name: provinces; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4569 (class 0 OID 31292)
-- Dependencies: 300
-- Name: record_permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.record_permissions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4560 (class 0 OID 18819)
-- Dependencies: 291
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4561 (class 0 OID 18833)
-- Dependencies: 292
-- Name: sub_services; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4578 (class 0 OID 46023)
-- Dependencies: 309
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4554 (class 0 OID 17383)
-- Dependencies: 285
-- Name: telekom_data; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.telekom_data ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4558 (class 0 OID 17611)
-- Dependencies: 289
-- Name: ticket_assignments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4557 (class 0 OID 17553)
-- Dependencies: 288
-- Name: ticket_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4559 (class 0 OID 17636)
-- Dependencies: 290
-- Name: ticket_sla_metrics; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ticket_sla_metrics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4553 (class 0 OID 17364)
-- Dependencies: 284
-- Name: tickets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4579 (class 0 OID 46042)
-- Dependencies: 310
-- Name: ulo_applications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ulo_applications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4572 (class 0 OID 45935)
-- Dependencies: 303
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4550 (class 0 OID 17325)
-- Dependencies: 281
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4546 (class 0 OID 17179)
-- Dependencies: 276
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4605 (class 3256 OID 17429)
-- Name: objects Admins can view all documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (((bucket_id = 'documents'::text) AND (public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role))));


--
-- TOC entry 4608 (class 3256 OID 17490)
-- Name: objects Admins can view all telekom files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Admins can view all telekom files" ON storage.objects FOR SELECT USING (((bucket_id = 'documents'::text) AND ((storage.foldername(name))[2] = 'telekom-data'::text) AND (public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'internal_admin'::public.app_role) OR public.has_role(auth.uid(), 'pengolah_data'::public.app_role))));


--
-- TOC entry 4677 (class 3256 OID 57505)
-- Name: objects Allow public read access to documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow public read access to documents" ON storage.objects FOR SELECT USING ((bucket_id = 'documents'::text));


--
-- TOC entry 4676 (class 3256 OID 57504)
-- Name: objects Allow public upload for registration documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow public upload for registration documents" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'documents'::text) AND ((storage.foldername(name))[1] = 'temp'::text)));


--
-- TOC entry 4603 (class 3256 OID 17427)
-- Name: objects Authenticated users can upload documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'documents'::text) AND (auth.uid() IS NOT NULL)));


--
-- TOC entry 4613 (class 3256 OID 17552)
-- Name: objects Users can delete documents they own or admins can delete any; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can delete documents they own or admins can delete any" ON storage.objects FOR DELETE USING (((bucket_id = 'documents'::text) AND (auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['super_admin'::public.app_role, 'internal_admin'::public.app_role, 'pengolah_data'::public.app_role]))))) OR (owner = auth.uid()))));


--
-- TOC entry 4609 (class 3256 OID 17491)
-- Name: objects Users can delete their own telekom files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can delete their own telekom files" ON storage.objects FOR DELETE USING (((bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]) AND ((storage.foldername(name))[2] = 'telekom-data'::text)));


--
-- TOC entry 4678 (class 3256 OID 57506)
-- Name: objects Users can manage their own documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can manage their own documents" ON storage.objects TO authenticated USING (((bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))) WITH CHECK (((bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- TOC entry 4655 (class 3256 OID 46096)
-- Name: objects Users can update their company documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can update their company documents" ON storage.objects FOR UPDATE USING (((bucket_id = 'license-documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- TOC entry 4612 (class 3256 OID 17551)
-- Name: objects Users can update their own documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can update their own documents" ON storage.objects FOR UPDATE USING (((bucket_id = 'documents'::text) AND (auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['super_admin'::public.app_role, 'internal_admin'::public.app_role, 'pengolah_data'::public.app_role]))))) OR (owner = auth.uid()))));


--
-- TOC entry 4611 (class 3256 OID 17550)
-- Name: objects Users can upload documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'documents'::text) AND (auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['super_admin'::public.app_role, 'internal_admin'::public.app_role, 'pengolah_data'::public.app_role, 'pelaku_usaha'::public.app_role])))))));


--
-- TOC entry 4653 (class 3256 OID 46094)
-- Name: objects Users can upload their company documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can upload their company documents" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'license-documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- TOC entry 4606 (class 3256 OID 17488)
-- Name: objects Users can upload their own telekom files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can upload their own telekom files" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]) AND ((storage.foldername(name))[2] = 'telekom-data'::text)));


--
-- TOC entry 4610 (class 3256 OID 17549)
-- Name: objects Users can view documents they have access to; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can view documents they have access to" ON storage.objects FOR SELECT USING (((bucket_id = 'documents'::text) AND (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['super_admin'::public.app_role, 'internal_admin'::public.app_role, 'pengolah_data'::public.app_role])))))) OR ((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true))))))));


--
-- TOC entry 4654 (class 3256 OID 46095)
-- Name: objects Users can view their company documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can view their company documents" ON storage.objects FOR SELECT USING (((bucket_id = 'license-documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- TOC entry 4604 (class 3256 OID 17428)
-- Name: objects Users can view their own documents; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (((bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- TOC entry 4607 (class 3256 OID 17489)
-- Name: objects Users can view their own telekom files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can view their own telekom files" ON storage.objects FOR SELECT USING (((bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]) AND ((storage.foldername(name))[2] = 'telekom-data'::text)));


--
-- TOC entry 4532 (class 0 OID 16544)
-- Dependencies: 253
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4556 (class 0 OID 17538)
-- Dependencies: 287
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4534 (class 0 OID 16586)
-- Dependencies: 255
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4533 (class 0 OID 16559)
-- Dependencies: 254
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4555 (class 0 OID 17493)
-- Dependencies: 286
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4547 (class 0 OID 17211)
-- Dependencies: 277
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4548 (class 0 OID 17225)
-- Dependencies: 278
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4682 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- TOC entry 4683 (class 6104 OID 17486)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- TOC entry 4684 (class 6106 OID 17487)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 4762 (class 0 OID 0)
-- Dependencies: 32
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- TOC entry 4763 (class 0 OID 0)
-- Dependencies: 14
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- TOC entry 4764 (class 0 OID 0)
-- Dependencies: 13
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 4765 (class 0 OID 0)
-- Dependencies: 9
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- TOC entry 4766 (class 0 OID 0)
-- Dependencies: 33
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- TOC entry 4767 (class 0 OID 0)
-- Dependencies: 15
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- TOC entry 4774 (class 0 OID 0)
-- Dependencies: 389
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- TOC entry 4775 (class 0 OID 0)
-- Dependencies: 408
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- TOC entry 4777 (class 0 OID 0)
-- Dependencies: 388
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- TOC entry 4779 (class 0 OID 0)
-- Dependencies: 387
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- TOC entry 4780 (class 0 OID 0)
-- Dependencies: 383
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- TOC entry 4781 (class 0 OID 0)
-- Dependencies: 384
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- TOC entry 4782 (class 0 OID 0)
-- Dependencies: 355
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- TOC entry 4783 (class 0 OID 0)
-- Dependencies: 385
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- TOC entry 4784 (class 0 OID 0)
-- Dependencies: 359
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4785 (class 0 OID 0)
-- Dependencies: 361
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4786 (class 0 OID 0)
-- Dependencies: 352
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- TOC entry 4787 (class 0 OID 0)
-- Dependencies: 351
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- TOC entry 4788 (class 0 OID 0)
-- Dependencies: 358
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4789 (class 0 OID 0)
-- Dependencies: 360
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4790 (class 0 OID 0)
-- Dependencies: 362
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- TOC entry 4791 (class 0 OID 0)
-- Dependencies: 363
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- TOC entry 4792 (class 0 OID 0)
-- Dependencies: 356
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- TOC entry 4793 (class 0 OID 0)
-- Dependencies: 357
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- TOC entry 4795 (class 0 OID 0)
-- Dependencies: 390
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- TOC entry 4797 (class 0 OID 0)
-- Dependencies: 394
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4799 (class 0 OID 0)
-- Dependencies: 391
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- TOC entry 4800 (class 0 OID 0)
-- Dependencies: 354
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4801 (class 0 OID 0)
-- Dependencies: 353
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- TOC entry 4802 (class 0 OID 0)
-- Dependencies: 339
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4803 (class 0 OID 0)
-- Dependencies: 338
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4804 (class 0 OID 0)
-- Dependencies: 340
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- TOC entry 4805 (class 0 OID 0)
-- Dependencies: 386
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- TOC entry 4806 (class 0 OID 0)
-- Dependencies: 382
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- TOC entry 4807 (class 0 OID 0)
-- Dependencies: 376
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4808 (class 0 OID 0)
-- Dependencies: 378
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4809 (class 0 OID 0)
-- Dependencies: 380
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4810 (class 0 OID 0)
-- Dependencies: 377
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4811 (class 0 OID 0)
-- Dependencies: 379
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4812 (class 0 OID 0)
-- Dependencies: 381
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4813 (class 0 OID 0)
-- Dependencies: 372
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- TOC entry 4814 (class 0 OID 0)
-- Dependencies: 374
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- TOC entry 4815 (class 0 OID 0)
-- Dependencies: 373
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4816 (class 0 OID 0)
-- Dependencies: 375
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4817 (class 0 OID 0)
-- Dependencies: 368
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- TOC entry 4818 (class 0 OID 0)
-- Dependencies: 370
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4819 (class 0 OID 0)
-- Dependencies: 369
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4820 (class 0 OID 0)
-- Dependencies: 371
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4821 (class 0 OID 0)
-- Dependencies: 364
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- TOC entry 4822 (class 0 OID 0)
-- Dependencies: 366
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- TOC entry 4823 (class 0 OID 0)
-- Dependencies: 365
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4824 (class 0 OID 0)
-- Dependencies: 367
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4825 (class 0 OID 0)
-- Dependencies: 392
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 393
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4828 (class 0 OID 0)
-- Dependencies: 395
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4829 (class 0 OID 0)
-- Dependencies: 346
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 347
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 348
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 349
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 350
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 341
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 342
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- TOC entry 4836 (class 0 OID 0)
-- Dependencies: 344
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 343
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- TOC entry 4838 (class 0 OID 0)
-- Dependencies: 345
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- TOC entry 4839 (class 0 OID 0)
-- Dependencies: 407
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- TOC entry 4840 (class 0 OID 0)
-- Dependencies: 337
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- TOC entry 4841 (class 0 OID 0)
-- Dependencies: 454
-- Name: FUNCTION approve_company(_company_id uuid, _verified_by uuid, _notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.approve_company(_company_id uuid, _verified_by uuid, _notes text) TO anon;
GRANT ALL ON FUNCTION public.approve_company(_company_id uuid, _verified_by uuid, _notes text) TO authenticated;
GRANT ALL ON FUNCTION public.approve_company(_company_id uuid, _verified_by uuid, _notes text) TO service_role;


--
-- TOC entry 4842 (class 0 OID 0)
-- Dependencies: 447
-- Name: FUNCTION calculate_sla_metrics(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_sla_metrics() TO anon;
GRANT ALL ON FUNCTION public.calculate_sla_metrics() TO authenticated;
GRANT ALL ON FUNCTION public.calculate_sla_metrics() TO service_role;


--
-- TOC entry 4843 (class 0 OID 0)
-- Dependencies: 451
-- Name: FUNCTION check_record_permission(_user_id uuid, _table_name text, _record_id uuid, _action text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_record_permission(_user_id uuid, _table_name text, _record_id uuid, _action text) TO anon;
GRANT ALL ON FUNCTION public.check_record_permission(_user_id uuid, _table_name text, _record_id uuid, _action text) TO authenticated;
GRANT ALL ON FUNCTION public.check_record_permission(_user_id uuid, _table_name text, _record_id uuid, _action text) TO service_role;


--
-- TOC entry 4844 (class 0 OID 0)
-- Dependencies: 450
-- Name: FUNCTION check_user_permission(_user_id uuid, _module_code text, _action text, _field_code text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_user_permission(_user_id uuid, _module_code text, _action text, _field_code text) TO anon;
GRANT ALL ON FUNCTION public.check_user_permission(_user_id uuid, _module_code text, _action text, _field_code text) TO authenticated;
GRANT ALL ON FUNCTION public.check_user_permission(_user_id uuid, _module_code text, _action text, _field_code text) TO service_role;


--
-- TOC entry 4845 (class 0 OID 0)
-- Dependencies: 448
-- Name: FUNCTION escalate_overdue_tickets(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.escalate_overdue_tickets() TO anon;
GRANT ALL ON FUNCTION public.escalate_overdue_tickets() TO authenticated;
GRANT ALL ON FUNCTION public.escalate_overdue_tickets() TO service_role;


--
-- TOC entry 4846 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION get_companies_for_management(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_companies_for_management() TO anon;
GRANT ALL ON FUNCTION public.get_companies_for_management() TO authenticated;
GRANT ALL ON FUNCTION public.get_companies_for_management() TO service_role;


--
-- TOC entry 4847 (class 0 OID 0)
-- Dependencies: 452
-- Name: FUNCTION get_user_permissions(_user_id uuid, _module_code text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_user_permissions(_user_id uuid, _module_code text) TO anon;
GRANT ALL ON FUNCTION public.get_user_permissions(_user_id uuid, _module_code text) TO authenticated;
GRANT ALL ON FUNCTION public.get_user_permissions(_user_id uuid, _module_code text) TO service_role;


--
-- TOC entry 4848 (class 0 OID 0)
-- Dependencies: 431
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- TOC entry 4849 (class 0 OID 0)
-- Dependencies: 430
-- Name: FUNCTION has_role(_user_id uuid, _role public.app_role); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO anon;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO service_role;


--
-- TOC entry 4850 (class 0 OID 0)
-- Dependencies: 449
-- Name: FUNCTION log_changes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.log_changes() TO anon;
GRANT ALL ON FUNCTION public.log_changes() TO authenticated;
GRANT ALL ON FUNCTION public.log_changes() TO service_role;


--
-- TOC entry 4851 (class 0 OID 0)
-- Dependencies: 455
-- Name: FUNCTION reject_company(_company_id uuid, _rejected_by uuid, _rejection_notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reject_company(_company_id uuid, _rejected_by uuid, _rejection_notes text) TO anon;
GRANT ALL ON FUNCTION public.reject_company(_company_id uuid, _rejected_by uuid, _rejection_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.reject_company(_company_id uuid, _rejected_by uuid, _rejection_notes text) TO service_role;


--
-- TOC entry 4852 (class 0 OID 0)
-- Dependencies: 457
-- Name: FUNCTION request_company_correction(_company_id uuid, _requested_by uuid, _correction_notes jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.request_company_correction(_company_id uuid, _requested_by uuid, _correction_notes jsonb) TO anon;
GRANT ALL ON FUNCTION public.request_company_correction(_company_id uuid, _requested_by uuid, _correction_notes jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.request_company_correction(_company_id uuid, _requested_by uuid, _correction_notes jsonb) TO service_role;


--
-- TOC entry 4853 (class 0 OID 0)
-- Dependencies: 458
-- Name: FUNCTION submit_company_corrections(_company_id uuid, _submitted_by uuid, _updated_data jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.submit_company_corrections(_company_id uuid, _submitted_by uuid, _updated_data jsonb) TO anon;
GRANT ALL ON FUNCTION public.submit_company_corrections(_company_id uuid, _submitted_by uuid, _updated_data jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.submit_company_corrections(_company_id uuid, _submitted_by uuid, _updated_data jsonb) TO service_role;


--
-- TOC entry 4854 (class 0 OID 0)
-- Dependencies: 432
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- TOC entry 4855 (class 0 OID 0)
-- Dependencies: 453
-- Name: FUNCTION user_has_role(_user_id uuid, _role public.user_role); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.user_has_role(_user_id uuid, _role public.user_role) TO anon;
GRANT ALL ON FUNCTION public.user_has_role(_user_id uuid, _role public.user_role) TO authenticated;
GRANT ALL ON FUNCTION public.user_has_role(_user_id uuid, _role public.user_role) TO service_role;


--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 414
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4857 (class 0 OID 0)
-- Dependencies: 423
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- TOC entry 4858 (class 0 OID 0)
-- Dependencies: 416
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- TOC entry 4859 (class 0 OID 0)
-- Dependencies: 412
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 411
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 415
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 417
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4863 (class 0 OID 0)
-- Dependencies: 410
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 409
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 413
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 418
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 397
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 399
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 400
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- TOC entry 4874 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- TOC entry 4877 (class 0 OID 0)
-- Dependencies: 259
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- TOC entry 4881 (class 0 OID 0)
-- Dependencies: 263
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 261
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 315
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 248
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 245
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 308
-- Name: TABLE activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.activity_logs TO anon;
GRANT ALL ON TABLE public.activity_logs TO authenticated;
GRANT ALL ON TABLE public.activity_logs TO service_role;


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 296
-- Name: TABLE api_integration_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.api_integration_logs TO anon;
GRANT ALL ON TABLE public.api_integration_logs TO authenticated;
GRANT ALL ON TABLE public.api_integration_logs TO service_role;


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 306
-- Name: TABLE application_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_documents TO anon;
GRANT ALL ON TABLE public.application_documents TO authenticated;
GRANT ALL ON TABLE public.application_documents TO service_role;


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 307
-- Name: TABLE application_evaluations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_evaluations TO anon;
GRANT ALL ON TABLE public.application_evaluations TO authenticated;
GRANT ALL ON TABLE public.application_evaluations TO service_role;


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 314
-- Name: TABLE application_workflow; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_workflow TO anon;
GRANT ALL ON TABLE public.application_workflow TO authenticated;
GRANT ALL ON TABLE public.application_workflow TO service_role;


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 295
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;


--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 312
-- Name: TABLE captcha_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.captcha_sessions TO anon;
GRANT ALL ON TABLE public.captcha_sessions TO authenticated;
GRANT ALL ON TABLE public.captcha_sessions TO service_role;


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 302
-- Name: TABLE companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.companies TO anon;
GRANT ALL ON TABLE public.companies TO authenticated;
GRANT ALL ON TABLE public.companies TO service_role;


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 318
-- Name: TABLE company_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.company_documents TO anon;
GRANT ALL ON TABLE public.company_documents TO authenticated;
GRANT ALL ON TABLE public.company_documents TO service_role;


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE faq_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.faq_categories TO anon;
GRANT ALL ON TABLE public.faq_categories TO authenticated;
GRANT ALL ON TABLE public.faq_categories TO service_role;


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE faqs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.faqs TO anon;
GRANT ALL ON TABLE public.faqs TO authenticated;
GRANT ALL ON TABLE public.faqs TO service_role;


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 298
-- Name: TABLE fields; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fields TO anon;
GRANT ALL ON TABLE public.fields TO authenticated;
GRANT ALL ON TABLE public.fields TO service_role;


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 313
-- Name: TABLE indonesian_regions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.indonesian_regions TO anon;
GRANT ALL ON TABLE public.indonesian_regions TO authenticated;
GRANT ALL ON TABLE public.indonesian_regions TO service_role;


--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 294
-- Name: TABLE kabupaten; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.kabupaten TO anon;
GRANT ALL ON TABLE public.kabupaten TO authenticated;
GRANT ALL ON TABLE public.kabupaten TO service_role;


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 305
-- Name: TABLE license_applications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.license_applications TO anon;
GRANT ALL ON TABLE public.license_applications TO authenticated;
GRANT ALL ON TABLE public.license_applications TO service_role;


--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 304
-- Name: TABLE license_services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.license_services TO anon;
GRANT ALL ON TABLE public.license_services TO authenticated;
GRANT ALL ON TABLE public.license_services TO service_role;


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 311
-- Name: TABLE login_attempts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.login_attempts TO anon;
GRANT ALL ON TABLE public.login_attempts TO authenticated;
GRANT ALL ON TABLE public.login_attempts TO service_role;


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 297
-- Name: TABLE modules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.modules TO anon;
GRANT ALL ON TABLE public.modules TO authenticated;
GRANT ALL ON TABLE public.modules TO service_role;


--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 301
-- Name: TABLE permission_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permission_templates TO anon;
GRANT ALL ON TABLE public.permission_templates TO authenticated;
GRANT ALL ON TABLE public.permission_templates TO service_role;


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 299
-- Name: TABLE permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permissions TO anon;
GRANT ALL ON TABLE public.permissions TO authenticated;
GRANT ALL ON TABLE public.permissions TO service_role;


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 319
-- Name: TABLE person_in_charge; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.person_in_charge TO anon;
GRANT ALL ON TABLE public.person_in_charge TO authenticated;
GRANT ALL ON TABLE public.person_in_charge TO service_role;


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 320
-- Name: TABLE pic_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pic_documents TO anon;
GRANT ALL ON TABLE public.pic_documents TO authenticated;
GRANT ALL ON TABLE public.pic_documents TO service_role;


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 293
-- Name: TABLE provinces; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.provinces TO anon;
GRANT ALL ON TABLE public.provinces TO authenticated;
GRANT ALL ON TABLE public.provinces TO service_role;


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 300
-- Name: TABLE record_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.record_permissions TO anon;
GRANT ALL ON TABLE public.record_permissions TO authenticated;
GRANT ALL ON TABLE public.record_permissions TO service_role;


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 291
-- Name: TABLE services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 292
-- Name: TABLE sub_services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sub_services TO anon;
GRANT ALL ON TABLE public.sub_services TO authenticated;
GRANT ALL ON TABLE public.sub_services TO service_role;


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 309
-- Name: TABLE support_tickets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.support_tickets TO anon;
GRANT ALL ON TABLE public.support_tickets TO authenticated;
GRANT ALL ON TABLE public.support_tickets TO service_role;


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE telekom_data; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.telekom_data TO anon;
GRANT ALL ON TABLE public.telekom_data TO authenticated;
GRANT ALL ON TABLE public.telekom_data TO service_role;


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 289
-- Name: TABLE ticket_assignments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ticket_assignments TO anon;
GRANT ALL ON TABLE public.ticket_assignments TO authenticated;
GRANT ALL ON TABLE public.ticket_assignments TO service_role;


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 288
-- Name: TABLE ticket_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ticket_messages TO anon;
GRANT ALL ON TABLE public.ticket_messages TO authenticated;
GRANT ALL ON TABLE public.ticket_messages TO service_role;


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 290
-- Name: TABLE ticket_sla_metrics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ticket_sla_metrics TO anon;
GRANT ALL ON TABLE public.ticket_sla_metrics TO authenticated;
GRANT ALL ON TABLE public.ticket_sla_metrics TO service_role;


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE tickets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tickets TO anon;
GRANT ALL ON TABLE public.tickets TO authenticated;
GRANT ALL ON TABLE public.tickets TO service_role;


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 310
-- Name: TABLE ulo_applications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ulo_applications TO anon;
GRANT ALL ON TABLE public.ulo_applications TO authenticated;
GRANT ALL ON TABLE public.ulo_applications TO service_role;


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 303
-- Name: TABLE user_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_profiles TO anon;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 281
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 316
-- Name: TABLE messages_2025_09_11; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_11 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_11 TO dashboard_user;


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 317
-- Name: TABLE messages_2025_09_12; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_12 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_12 TO dashboard_user;


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 321
-- Name: TABLE messages_2025_09_13; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_13 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_13 TO dashboard_user;


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 322
-- Name: TABLE messages_2025_09_14; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_14 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_14 TO dashboard_user;


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 323
-- Name: TABLE messages_2025_09_15; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_15 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_15 TO dashboard_user;


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 324
-- Name: TABLE messages_2025_09_16; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_16 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_16 TO dashboard_user;


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 325
-- Name: TABLE messages_2025_09_17; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_17 TO dashboard_user;


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 273
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 272
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 253
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 287
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 254
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 277
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 278
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 257
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- TOC entry 2573 (class 826 OID 16601)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2574 (class 826 OID 16602)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2572 (class 826 OID 16600)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2583 (class 826 OID 16680)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2582 (class 826 OID 16679)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- TOC entry 2581 (class 826 OID 16678)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2586 (class 826 OID 16635)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2585 (class 826 OID 16634)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2584 (class 826 OID 16633)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2578 (class 826 OID 16615)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2580 (class 826 OID 16614)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2579 (class 826 OID 16613)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2565 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2566 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2564 (class 826 OID 16487)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2568 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2563 (class 826 OID 16486)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2567 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2576 (class 826 OID 16605)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2577 (class 826 OID 16606)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2575 (class 826 OID 16604)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2571 (class 826 OID 16543)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2570 (class 826 OID 16542)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2569 (class 826 OID 16541)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 3753 (class 3466 OID 16619)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- TOC entry 3758 (class 3466 OID 16698)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- TOC entry 3752 (class 3466 OID 16617)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- TOC entry 3759 (class 3466 OID 16701)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- TOC entry 3754 (class 3466 OID 16620)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- TOC entry 3755 (class 3466 OID 16621)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

-- Completed on 2025-09-15 01:35:39

--
-- PostgreSQL database dump complete
--

\unrestrict MZPRZdjqiLcHhQTxjMcOD20EwLCLU8w1OL0RyRVyQ6KGZFWCUmsmh5yR4d1MoPe

