# KBLU
Web-dev project 

## REST API Doc

## 1. Authentication

| Method | Endpoint                        | Auth    | Description                      | Body                                      |
|:------:|---------------------------------|:-------:|----------------------------------|-------------------------------------------|
| POST   | `/api/auth/login/`              | Public  | Obtain JWT tokens                | `{ "username": "...", "password": "..." }` |
| POST   | `/api/auth/logout/`             | Public  | Blacklist refresh token          | `{ "refresh": "<refresh_token>" }`         |
| POST   | `/api/auth/oauth/`              | Public  | (Stub) OAuth login               | `{ "token": "<oauth_token>" }`             |
| POST   | `/api/auth/token/refresh/`      | Public  | Exchange refresh token for new access token | `{ "refresh": "<refresh_token>" }` |

**Responses**  
- **login** →  
  ```json
  { "refresh": "...", "access": "..." }
  ```  
- **logout** → `204 No Content`  
- **oauth** → `501 Not Implemented`  
- **token/refresh** →  
  ```json
  { "access": "..." }
  ```  

---

## 2. Profiles

| Method       | Endpoint                      | Auth                  | Description                   |
|:------------:|-------------------------------|:---------------------:|-------------------------------|
| GET          | `/api/profiles/`              | Public                | List & filter profiles        |
| POST         | `/api/profiles/`              | Public                | Create new profile + user     |
| GET          | `/api/profiles/{profile_id}/` | **Bearer JWT**        | Retrieve single profile       |
| PUT / PATCH  | `/api/profiles/{profile_id}/` | **Bearer JWT** (owner) | Replace or update profile     |
| DELETE       | `/api/profiles/{profile_id}/` | **Bearer JWT** (owner) | Delete profile & user         |

**Query Parameters (GET `/api/profiles/`)**  
- `?name=`  filter by username or full name (case-insensitive substring)  
- `?major=` filter by major  
- `?university=` filter by university  

**Create / Update Body**  
Fields required on **POST** (see `ProfileCreateSerializer`):  
```json
{
  "username":       "jdoe",
  "password":       "secret123",
  "email":          "jdoe@example.com",
  "full_name":      "John Doe",
  "university":     "State U",
  "major":          "CS",
  "location":       "NYC",
  "gender":         "male",
  "age":            21,
  "profile_picture":"https://…",      // optional
  "preferred_gender":"female",
  "preferred_age_min":18,
  "preferred_age_max":25,
  "preferred_university":"",          // optional
  "preferred_major":""                // optional
}
```

On **PUT/PATCH**, send any subset of the above fields (except `password` on PATCH).

---

## 3. Preferences

| Method      | Endpoint                                 | Auth                  | Description                              |
|:-----------:|------------------------------------------|:---------------------:|------------------------------------------|
| PUT / PATCH | `/api/preferences/{profile_id}/`         | **Bearer JWT** (owner) | Update matching preferences only         |

**Body** (all fields required for PUT; same for PATCH):  
```json
{
  "preferred_gender":   "female",
  "preferred_age_min":  18,
  "preferred_age_max":  25,
  "preferred_university":"State U",  // optional
  "preferred_major":    "CS"         // optional
}
```

---

## 4. Match System (Swipes & Matches)

| Method | Endpoint          | Auth           | Description                                | Body                       |
|:------:|-------------------|:--------------:|--------------------------------------------|----------------------------|
| POST   | `/api/swipes/`    | **Bearer JWT** | Record a like or reject swipe              | `{ "from_profile": "<uuid>", "to_profile": "<uuid>", "decision": "like" }` |
| PATCH  | `/api/swipes/`    | **Bearer JWT** | Change your existing swipe decision        | same as POST               |
| GET    | `/api/matches/`   | **Bearer JWT** | List all mutual “like” matches             | —                          |

**Matches** returns an array of `Profile` objects you’ve both “liked.”

---

## 5. Chat & Messaging

| Method   | Endpoint                                           | Auth           | Description                            | Body                         |
|:--------:|----------------------------------------------------|:--------------:|----------------------------------------|------------------------------|
| GET      | `/api/chats/`                                      | **Bearer JWT** | List all 1–1 chats for current profile | —                            |
| POST     | `/api/chats/`                                      | **Bearer JWT** | Open or fetch a chat with another user | `{ "user2": "<profile_uuid>" }`      |
| GET      | `/api/chats/{chat_id}/messages/`                   | **Bearer JWT** | List messages in a chat                | —                            |
| POST     | `/api/chats/{chat_id}/messages/`                   | **Bearer JWT** | Send a message in a chat               | `{ "content": "Hello!" }`    |
| DELETE   | `/api/chats/{chat_id}/messages/{message_id}/`      | **Bearer JWT** | Delete your own message                | —                            |

**Chat** objects include `id`, `user1`, `user2`, `created_at`.  
**Message** objects include `id`, `chat`, `sender`, `content`, `timestamp`, `read`.

---

### Authentication Header

For all endpoints requiring auth, include (Bearer Token in Postman):

```
Authorization: Bearer <access_token>
```
