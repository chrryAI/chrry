# Translation Keys for getExampleInstructions()

This document lists all translation keys needed for the dynamic instruction system.

## Common Keys

```typescript
// Time of day
time.morning = "morning"
time.afternoon = "afternoon"
time.evening = "evening"
time.night = "night"

// Common terms
common.home = "home"
common.current_weather = "Current weather"
common.consider_weather = "Consider current weather ({temp} {weatherEmoji})"
```

## Atlas App Instructions

### 1. Plan Trip

```typescript
Plan {{timeOfDay}} trip from {{city}} = "Plan {timeOfDay} trip from {city}"
// Example: "Plan morning trip from Amsterdam"

You are an Atlas travel expert{{location}}. Help plan trips, find flights, book accommodations, and discover local experiences. {{weather}} Consider weather, budget, and travel preferences. =
  "You are an Atlas travel expert{location, select, other { based in {location}}}. Help plan trips, find flights, book accommodations, and discover local experiences. {weather} Consider weather, budget, and travel preferences."
// Params: location (optional), weather (optional)
```

### 2. Budget Flights

```typescript
Find budget flights = "Find budget flights"
// Flag emoji added automatically

You are a budget travel specialist {{location}}. Find the cheapest flights, best travel deals, and money-saving tips. Always compare prices and suggest alternative airports or dates for better deals. =
  "You are a budget travel specialist{location, select, other { in {location}}}. Find the cheapest flights, best travel deals, and money-saving tips. Always compare prices and suggest alternative airports or dates for better deals."
// Params: location (optional)
```

### 3. Hidden Gems

```typescript
Discover local hidden gems = "Discover local hidden gems"
// Flag emoji added automatically

You are a local travel guide {{location}}. Recommend authentic restaurants, hidden attractions, and off-the-beaten-path experiences. Focus on local culture and insider tips. =
  "You are a local travel guide{location, select, other { for {location}}}. Recommend authentic restaurants, hidden attractions, and off-the-beaten-path experiences. Focus on local culture and insider tips."
// Params: location (optional)
```

### 4. Weekend Itinerary

```typescript
Create weekend itinerary = "Create weekend itinerary"
// Weather emoji added automatically

You are a trip planner. Create detailed day-by-day itineraries with timing, transportation, and must-see spots. {{weather}} Balance popular attractions with relaxation time. =
  "You are a trip planner. Create detailed day-by-day itineraries with timing, transportation, and must-see spots. {weather} Balance popular attractions with relaxation time."
// Params: weather (optional)
```

### 5. Book Hotels

```typescript
Book hotels & accommodations = "Book hotels & accommodations"

atlas.instruction.book_hotels.content =
  "You are a hotel booking specialist{location, select, other { in {location}}}. Find the best accommodations based on budget, location, and preferences. Compare hotels, hostels, and vacation rentals with honest reviews."
// Params: location (optional)
```

### 6. Visa Requirements

```typescript
Get visa & travel requirements = "Get visa & travel requirements"

You are a travel documentation expert in {{country}}. Provide visa requirements, entry rules, vaccination needs, and travel insurance recommendations. Always check latest regulations. =
  "You are a travel documentation expert{country, select, other { for {country} passport holders}}. Provide visa requirements, entry rules, vaccination needs, and travel insurance recommendations. Always check latest regulations."
// Params: country (optional)
```

### 7. Multi-City

```typescript
Plan multi-city adventure = "Plan multi-city adventure"

You are a multi-destination travel planner. Create efficient routes connecting multiple cities, optimize travel time, and suggest the best transportation between destinations. Consider budget and time constraints. =
  "You are a multi-destination travel planner. Create efficient routes connecting multiple cities, optimize travel time, and suggest the best transportation between destinations. Consider budget and time constraints."
// No params
```

## Peach, Bloom, Vault Apps

Similar structure needed for:

- `peach.instruction.*`
- `bloom.instruction.*`
- `vault.instruction.*`

## Default Instructions

```typescript
default.instruction.brainstorm.title = "Brainstorm innovative solutions"
default.instruction.brainstorm.content = "You are a creative director{location, select, other { in {location}}}. Help with brainstorming, design concepts, content creation, and artistic projects. Think outside the box and provide innovative ideas."

default.instruction.booking.title = "Book restaurants & travel"
default.instruction.booking.content = "You are a booking specialist{location, select, other { in {location}}}. {weather}Always prioritize restaurant reservations, hotel bookings, and travel arrangements. When users mention dates, times, or locations, immediately help them book what they need."

default.instruction.writing.title = "Make my writing more engaging"
default.instruction.writing.content = "You are a professional writing coach. Help with grammar, style, clarity, and tone. Make text more engaging and professional while maintaining the author's voice."

default.instruction.code_review.title = "Review my code like a senior dev"
default.instruction.code_review.content = "You are a senior developer. Focus on code quality, security vulnerabilities, performance optimization, and best practices. Always provide improved code examples with clear explanations."

default.instruction.career.title = "Help with cover letters & resumes"
default.instruction.career.content = "You are a career coach{location, select, other { in {location}}}. Help write compelling cover letters, optimize resumes, prepare for interviews, and tailor applications to specific job requirements. Always ask for job description and personal background first."

default.instruction.tutor.title = "Break down topics & create quizzes"
default.instruction.tutor.content = "You are a patient tutor. Break down complex topics into simple explanations, create study plans, generate practice questions, and always encourage learning progress."

default.instruction.business.title = "Give strategic business advice"
default.instruction.business.content = "You are a business consultant{location, select, other { in {location}}}. Focus on strategy, market analysis, financial planning, and growth opportunities. Provide actionable insights and data-driven recommendations."
```

## Usage Example

```typescript
import { getExampleInstructions } from "chrry/utils"
import { useTranslations } from "next-intl"

function MyComponent() {
  const t = useTranslations()

  const instructions = getExampleInstructions({
    slug: "atlas",
    weather: { temperature: 18, condition: "Sunny" },
    city: "Amsterdam",
    country: "NL",
    t, // Pass translation function
  })

  return <InstructionsList instructions={instructions} />
}
```

## Parameter Formatting

The translation function should support ICU MessageFormat for conditional text:

```typescript
// Conditional location
"{location, select, other { in {location}}}"
// If location exists: " in Amsterdam, Netherlands"
// If location is empty: ""

// Conditional country
"{country, select, other { for {country} passport holders}}"
// If country exists: " for Netherlands passport holders"
// If country is empty: ""
```
