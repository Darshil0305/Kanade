# Kanade 🎌 - Technical Design Document

This document outlines the technical architecture, main features, and design patterns for the Kanade anime streaming application.

## 📐 Technical Architecture

### Monorepo Structure with Turbo

```
kanade/
├── apps/
│   └── web/                 # Next.js 15 web application
├── packages/
│   ├── ui/                  # Shared UI component library
│   ├── api-client/          # Central API client package
│   └── types/               # Shared TypeScript types
├── turbo.json              # Turbo configuration
├── package.json            # Root package.json
└── tsconfig.json           # Base TypeScript config
```

**Key Architecture Decisions:**
- **Monorepo with Turbo**: Enables efficient build caching and dependency management
- **Next.js 15 + React 19**: Latest features including React Server Components and improved streaming
- **Centralized API Client**: Single source of truth for HiAnime API interactions
- **Shared UI Package**: Reusable components across potential future apps (mobile, desktop)

### Application Layers

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (Next.js 15 + React 19 Components) │
├─────────────────────────────────────┤
│            Business Logic           │
│      (React Hooks + State Mgmt)     │
├─────────────────────────────────────┤
│           API Client Layer          │
│     (Centralized HiAnime Client)    │
├─────────────────────────────────────┤
│           External APIs             │
│         (HiAnime API v1)            │
└─────────────────────────────────────┘
```

## 🏗️ Main Features & Component Design

### 1. API Client Structure (`packages/api-client`)

**Core Client Architecture:**
```typescript
// Base client with error handling and caching
class KanadeAPIClient {
  private baseURL = 'https://hianime-api-qdks.onrender.com/api/v1'
  
  // Core methods
  search(query: string, options?: SearchOptions)
  getAnimeDetails(id: string)
  getEpisodes(animeId: string)
  getStreamingLinks(episodeId: string)
  getGenres()
  getTrending()
  getRecent()
}
```

**Key Features:**
- TypeScript-first with full type definitions
- Built-in caching layer for improved performance
- Error boundary integration
- Request deduplication
- Automatic retry logic with exponential backoff

### 2. HLS Video Player Component

**Component Hierarchy:**
```
VideoPlayer/
├── PlayerContainer          # Main wrapper with controls
├── VideoElement            # Core HLS video element
├── ControlBar              # Play/pause, timeline, volume
├── QualitySelector         # Resolution switching
├── SubtitleOverlay         # Subtitle display
└── LoadingSpinner          # Buffering states
```

**Technical Implementation:**
- HLS.js integration for adaptive streaming
- Custom controls with keyboard shortcuts
- Picture-in-picture support
- Fullscreen API integration
- Progressive enhancement for mobile

### 3. Search & Browse Flows

**Search Architecture:**
```
Search Flow:
├── SearchInput              # Debounced input with suggestions
├── SearchFilters            # Genre, year, status filters
├── SearchResults            # Virtualized result grid
└── SearchPagination         # Infinite scroll implementation

Browse Flow:
├── BrowseCategories         # Trending, recent, by genre
├── AnimeGrid               # Responsive card layout
├── AnimeCard               # Individual anime preview
└── CategoryTabs            # Navigation between categories
```

**Performance Optimizations:**
- Virtual scrolling for large result sets
- Image lazy loading with blur placeholders
- Intersection Observer for pagination
- Client-side filtering for instant feedback

### 4. Navigation & Routing Structure

**Route Architecture:**
```
/                           # Homepage with trending/recent
/search                     # Search results page
/anime/[id]                 # Anime details page
/anime/[id]/episode/[ep]    # Episode player page
/genres                     # Browse by genre
/genres/[genre]             # Genre-specific listings
```

**Navigation Components:**
- Responsive header with search integration
- Breadcrumb navigation for deep pages
- Mobile-first hamburger menu
- Back/forward browser integration

## 🎨 UI/UX Design Principles

### Design System Foundation

**Color Palette:**
```css
/* Dark Mode (Primary) */
--primary-bg: #0a0a0a
--secondary-bg: #1a1a1a
--accent: #ff6b35
--text-primary: #ffffff
--text-secondary: #b3b3b3

/* Light Mode */
--primary-bg: #ffffff
--secondary-bg: #f5f5f5
--accent: #ff6b35
--text-primary: #1a1a1a
--text-secondary: #666666
```

**Typography Scale:**
```css
--font-family: 'Inter', system-ui, sans-serif
--text-xs: 0.75rem
--text-sm: 0.875rem
--text-base: 1rem
--text-lg: 1.125rem
--text-xl: 1.25rem
--text-2xl: 1.5rem
--text-3xl: 1.875rem
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

**Grid System:**
- 1 column on mobile (< 640px)
- 2-3 columns on tablet (640px - 1024px)
- 4-6 columns on desktop (> 1024px)
- Flexible spacing using CSS Grid

### Key UI Patterns

**1. Card-based Layout:**
```
┌─────────────────┐
│   Anime Cover   │
│     Image       │
├─────────────────┤
│   Title         │
│   Year • Genre  │
│   ★★★★☆        │
└─────────────────┘
```

**2. Progressive Loading:**
- Skeleton screens during data fetching
- Blur-to-sharp image transitions
- Staggered animation on list items

**3. Accessibility Features:**
- ARIA labels and landmarks
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader optimized content

### Mobile-First Responsive Design

**Navigation Patterns:**
- Bottom tab bar on mobile
- Collapsible sidebar on desktop
- Swipe gestures for episode navigation
- Pull-to-refresh on mobile lists

**Touch Optimizations:**
- Minimum 44px touch targets
- Swipe gestures for video controls
- Long-press context menus
- Haptic feedback integration

## 🔧 Component Hierarchy & Architecture

### Core Application Structure

```
App (Next.js 15)
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── SearchBar
│   │   ├── ThemeToggle
│   │   └── UserMenu
│   ├── Navigation
│   │   ├── MainNav (Desktop)
│   │   └── BottomNav (Mobile)
│   └── Footer
├── Pages
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── TrendingCarousel
│   │   ├── RecentUpdates
│   │   └── GenreShowcase
│   ├── SearchPage
│   │   ├── SearchInput
│   │   ├── FilterSidebar
│   │   └── ResultsGrid
│   ├── AnimeDetailPage
│   │   ├── AnimeHero
│   │   ├── AnimeInfo
│   │   ├── EpisodeList
│   │   └── RecommendedAnime
│   └── PlayerPage
│       ├── VideoPlayer
│       ├── EpisodeNavigation
│       └── AnimeDetails
└── Shared Components
    ├── AnimeCard
    ├── LoadingStates
    ├── ErrorBoundary
    └── Modal
```

### State Management Architecture

**Client State (React):**
- Local component state for UI interactions
- React Context for theme and user preferences
- Custom hooks for complex logic

**Server State (React Query/SWR):**
- API response caching
- Background refetching
- Optimistic updates
- Error retry logic

## 📊 High-Level System Diagrams

### Data Flow Architecture

```
User Interaction
      ↓
 React Components
      ↓
 Custom Hooks
      ↓
 API Client Layer
      ↓
 HTTP Request
      ↓
 HiAnime API
      ↓
 Response Caching
      ↓
 UI Update
```

### Build & Deployment Pipeline

```
Development
     ↓
Turbo Build System
     ↓
Type Checking (TypeScript)
     ↓
Linting (ESLint)
     ↓
Testing (Jest/Playwright)
     ↓
Production Build
     ↓
Static Export (Next.js)
     ↓
Deployment (Vercel/Netlify)
```

### Performance Optimization Strategy

```
Code Splitting
├── Route-based splitting
├── Component lazy loading
└── Dynamic imports

Asset Optimization
├── Image optimization (Next.js)
├── Font preloading
└── Critical CSS inlining

Caching Strategy
├── API response caching
├── Static asset caching
└── Service worker caching
```

## 🎯 Design Goals Summary

1. **Performance First**: Fast loading, smooth animations, optimized bundle size
2. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
3. **Mobile Experience**: Touch-optimized, offline capability, progressive web app features
4. **Developer Experience**: Type safety, hot reloading, comprehensive testing
5. **Scalability**: Modular architecture, easy feature addition, performance monitoring

## 📚 References

- **Planning Details**: See `Planning.md` for development timeline and milestones
- **Task Breakdown**: See `Tasks.md` for detailed implementation tasks
- **API Documentation**: [HiAnime API](https://github.com/yahyaMomin/hianime-API)
- **Next.js 15 Guide**: [Next.js Documentation](https://nextjs.org/docs)
- **React 19 Features**: [React Blog](https://react.dev/blog)

---

*This design document serves as the architectural foundation for the Kanade project. It should be updated as the project evolves and new requirements emerge.*
