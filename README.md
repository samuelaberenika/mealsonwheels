# 🍽️ MealsOnWheels - Beneficiary Registration System

> A full-stack web registration platform built for the **Saint Vincent de Paul Society (SSVP)** in Lagos, Nigeria - designed to manage beneficiary sign-ups, meal allocation, partner onboarding, and approval workflows from end to end.

---

## 📌 Overview

Nigeria's economic challenges have left millions unable to access adequate nutrition. In Lagos State alone - with a population exceeding 25 million - an estimated 1 in 5 residents lack daily access to a nutritious meal. The MealsOnWheels programme directly addresses this by connecting vulnerable individuals (orphans, the elderly, the sick, the unemployed) with cooked meals and raw food ingredients through a structured, volunteer-led process.

This system was commissioned to **replace a manual, paper-based workflow** with a secure, user-friendly digital registration platform - reducing administrative overhead and ensuring only verified beneficiaries receive assistance.

---

## 🎯 Problem Statement

The SSVP previously handled beneficiary registration entirely on paper. This created:
- **No audit trail** for approvals or rejections
- **Data inconsistency** across different society members' records
- **No structured workflow** for review, approval, and confirmation stages
- **Delayed onboarding** for time-sensitive food assistance

---

## ✅ Solution

A multi-page web application that digitises the full beneficiary lifecycle:

| Stage | Feature |
|---|---|
| **Registration** | Online form capturing beneficiary details, needs, and eligibility criteria |
| **Review** | Society members can view and assess pending applications |
| **Approval** | President/Secretary confirm or reject based on criteria |
| **Confirmation** | Beneficiary notified with meal type, start date, and duration |
| **Partner Onboarding** | Separate registration flows for food vendors, grocery stores, and logistics partners |

---

## 🔍 Research & Design Process

Before writing a line of code, I conducted structured user research to ground the system in real operational needs:

- **User interviews** with SSVP members to map existing workflows and identify friction points
- **Task observation** sessions to understand how forms were currently being filled and reviewed
- **Document analysis** of the existing paper registration forms and approval records

This research directly shaped the data model, form fields, and the 3-stage approval flow.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend / Database** | Python, SQLite |
| **Pages** | Homepage, Login, Sign Up, Donor Portal, Vendor Portal, Logistics Portal |

### Repository Structure

```
mealsonwheels/
├── HTML/               # Page templates
├── CSS/                # Stylesheets per page
├── JS/                 # Client-side logic
├── PY/                 # Python scripts
├── HomePage.html       # Landing page
├── Login.html          # Authentication
├── Signup.html         # New user registration
├── donor.html          # Donor/sponsor portal
├── vendor.html         # Food vendor registration
├── logistics.html      # Logistics partner portal
├── make_db.py          # Database initialisation script
└── test.py             # Test suite
```

---

## 👥 User Roles

```
┌─────────────────────────────────────────────┐
│              MealsOnWheels System            │
├──────────────┬──────────────┬────────────────┤
│  Society     │  Beneficiary │  Partners      │
│  Member      │              │                │
│  (Sponsor)   │              │  • Food Vendor │
│              │              │  • Grocery     │
│  Registers   │  Receives    │  • Logistics   │
│  beneficiary │  meals       │                │
└──────────────┴──────────────┴────────────────┘
```

**Three meal categories are supported:**
- 🍳 **Cooked Food** - for those unable to cook (once/twice daily, up to 2 months)
- 🥦 **Raw Ingredients** - for those who can cook but lack supplies (weekly/bi-weekly)
- 🤝 **Combined** - for special cases such as pregnancy or specific dietary needs

---

## 🔒 Security & Compatibility Considerations

- Form inputs validated client-side and server-side to prevent malformed data
- SQLite database kept local - no external data transmission
- Platform compatibility tested across major browsers
- Beneficiary data handled with confidentiality in line with SSVP privacy guidelines

---

## 🚧 Known Limitations & Future Improvements

| Limitation | Planned Improvement |
|---|---|
| SQLite doesn't scale beyond ~10 concurrent users | Migrate to PostgreSQL for production |
| No authentication system beyond login page | Implement JWT-based auth with role separation |
| No email notification on approval | Add SMTP integration for automated confirmations |
| No admin dashboard | Build a management panel with filter/search |

---

## 📸 Screenshots

> *Screenshots to be added - run locally to view the full UI.*

---

## ⚙️ Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/samuelaberenika/mealsonwheels.git
cd mealsonwheels

# 2. Initialise the database
python3 make_db.py

# 3. Open the homepage in your browser
open HomePage.html
```

> **Note:** Python 3 and SQLite are required. No additional dependencies needed.

---

## 🧪 Running Tests

```bash
python3 test.py
```

---

## 📄 Documentation

Full service documentation covering beneficiary eligibility criteria, meal categories, enrolment procedures, and partner requirements is available in the `/docs` folder.

---

## 🤝 Client

Built for the **Saint Vincent de Paul Society (SSVP)**, Lagos, Nigeria - a Catholic charitable organisation operating globally to provide direct person-to-person service to individuals in need.

---

## 👨‍💻 Developer

**Samuel Aberenika**  
Computer Science (Cybersecurity) - University of Plymouth  
[LinkedIn](https://linkedin.com/in/samuelaberenika) · [GitHub](https://github.com/samuelaberenika) · samuel.aberenika07@gmail.com

---

*Built with real user research. Designed for real impact.*
