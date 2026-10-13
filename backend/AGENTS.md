# Einstein Pub — backend

Django 6 + Django REST Framework, Python 3.13+, SQLite (`db.sqlite3`). Serves the JSON API for the site in `frontend/` and the Django admin, where staff edit the menu, events and gallery and handle bookings. Admin texts and API error messages are in Russian.

## Setup and commands

Run from `backend/`:

- `python -m venv .venv`, then activate it: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate`
- `pip install -r requirements.txt`
- copy `.env.example` to `.env` and set `SECRET_KEY` (the file shows how to generate one)
- `python manage.py migrate` - creates tables, the starter menu and the "Персонал" group
- `python manage.py createsuperuser` - the first admin account
- `python manage.py runserver` - http://localhost:8000; the frontend dev server (http://localhost:8443) proxies `/api`, `/admin`, `/static` and `/media` here, so open the site and the admin through :8443

Staff accounts: create a user in the admin, tick "Статус персонала" and add them to the "Персонал" group (menu, events, gallery and bookings, no access to users).

## Project Structure

- `config/settings.py` - settings; secrets and environment-specific values come from `.env` via python-decouple
- `config/urls.py` - all routes: `admin/` and the API
- `apps/images.py` - shrinking uploaded photos to 1600 px WebP, and the serializer field that returns them as `/media/...` paths
- `apps/menu/` - `Category` and `Dish`; `GET /api/menu/` returns active categories with available dishes; migration `0002` adds the starter menu
- `apps/events/` - `Event`; `GET /api/events/` returns published events from today on
- `apps/gallery/` - `Photo`; `GET /api/gallery/`
- `apps/bookings/` - `Booking`; `POST /api/bookings/` validates time slots and dates (kept in sync with `frontend/src/pages/Booking.tsx`), limited to 5 requests per hour per IP
- `apps/users/` - custom `User`; migration `0002` creates the "Персонал" group
