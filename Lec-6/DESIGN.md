# Assessment UI/UX Design Specification (`design.md`)

## 1. Overview & Layout Strategy
- **Format:** Single Question per Page (Paginated Quiz Runner)
- **Primary Goal:** Focus user attention on one problem at a time while providing clear feedback on XP, correct answers, and progress.
- **Context:** Revision Mode for *Curse of Dimensionality, Filter Methods, Variance Threshold, Pearson Correlation, Wrapper Methods*.

---

## 2. Color Palette & Visual Tokens

| Token Name | Hex Code | Visual Use |
| :--- | :--- | :--- |
| **Primary Background** | `#F8FAFC` | Page background |
| **Card Surface** | `#FFFFFF` | Main question container & option cards |
| **Text Primary** | `#0F172A` | Question text & headings |
| **Text Secondary** | `#64748B` | Subtitles, meta-text, and question labels |
| **Border Neutral** | `#E2E8F0` | Default option card borders |
| **Accent Gold** | `#EAB308` | XP coin badge & score highlights |
| **Success Green** | `#22C55E` | Correct option highlight & success badge |
| **Success Light** | `#F0FDF4` | Selected correct option background |
| **Error Red** | `#EF4444` | Incorrect selection highlight |
| **Error Light** | `#FEF2F2` | Selected incorrect option background |

---

## 3. UI Component Architecture

### A. Top Navigation Header
- **Back Action:** `< Back` (`#0F172A`, 14px Semi-Bold)
- **Banner Banner:** Light Yellow/Gray (`#FEF9C3`) containing:
  - **Status:** Revision Mode Notice (`#854D0E`)
  - **Action Button:** `Show Original Attempt` (`#0F172A` border, white surface)

### B. Question Header Card
- **Question Indicator:** `QUESTION X/8` (`#64748B`, 12px Bold, Uppercase)
- **XP Badge:** Gold Coin Icon + `X/X XP` (`#EAB308`, 14px Bold)
- **Question Prompt:** `#0F172A`, 18px Bold, 1.5 Line Height, rendered with standard LaTeX ($f_j$, $\tau$, $\text{Var}$)

### C. Multiple Choice Options (Vertical Stack)
- **Default State:**
  - Background: `#FFFFFF`
  - Border: `1px solid #E2E8F0`
  - Choice Letter: `A`, `B`, `C`, `D` in a `#F1F5F9` rounded box
- **Selected & Correct State:**
  - Background: `#F0FDF4`
  - Border: `2px solid #22C55E`
  - Choice Letter: Green background with white text
- **Selected & Incorrect State:**
  - Background: `#FEF2F2`
  - Border: `2px solid #EF4444`

---

## 4. Paginated Question Data Structure

### Page 1 / 8
```json
{
  "question_id": 1,
  "xp_worth": 2,
  "prompt": "For feature $f_j$, the variance is defined as $\\text{Var}(f_j) = \\frac{1}{n} \\sum_{i=1}^{n} (x_{ij} - \\bar{x}_j)^2$. Given a threshold $\\tau$, what is the removal rule?",
  "options": [
    { "key": "A", "text": "Remove $f_j$ when $\\text{Var}(f_j) < \\tau$", "is_correct": true },
    { "key": "B", "text": "Remove $f_j$ when $\\text{Var}(f_j) > \\tau$", "is_correct": false },
    { "key": "C", "text": "Remove $f_j$ only when $\\text{Var}(f_j) = 0$", "is_correct": false },
    { "key": "D", "text": "Remove $f_j$ when $\\tau < 0$", "is_correct": false }
  ]
}