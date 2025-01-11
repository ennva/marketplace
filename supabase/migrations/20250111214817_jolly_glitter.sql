/*
  # Add Sample Marketplace Assets
  
  1. Sample Data
    - Add diverse sample assets across different categories
    - Include realistic pricing and metrics
    - Create with existing user profiles
  
  2. Data Structure
    - Assets linked to the first registered user
    - Realistic metrics and pricing for each category
    - All assets set as active for immediate visibility
*/

-- Insert sample assets
INSERT INTO assets (
  seller_id,
  title,
  description,
  category,
  price,
  monthly_revenue,
  monthly_profit,
  monthly_visitors,
  page_views,
  status
) VALUES
-- Websites
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'Premium Food Blog',
  'Established food blog with over 500 recipes, strong SEO presence, and growing ad revenue. Includes custom recipe plugin and email list of 15,000 subscribers.',
  'website',
  75000,
  4500,
  3800,
  85000,
  150000,
  'active'
),
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'Tech Review Platform',
  'Technology review website with 300+ in-depth reviews, affiliate partnerships with major tech brands, and strong domain authority.',
  'website',
  120000,
  8500,
  6200,
  95000,
  180000,
  'active'
),
-- Apps
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'Fitness Tracking App',
  'iOS and Android fitness app with 50,000 active users. Features workout planning, progress tracking, and nutrition logging.',
  'app',
  95000,
  6000,
  4500,
  45000,
  280000,
  'active'
),
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'Meditation Timer Pro',
  'Popular meditation app with premium subscription model. Includes guided sessions, progress tracking, and integration with health platforms.',
  'app',
  65000,
  3200,
  2800,
  28000,
  120000,
  'active'
),
-- Domains
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'travel.io',
  'Premium travel-related domain name, perfect for travel booking platforms or travel content sites.',
  'domain',
  45000,
  0,
  0,
  0,
  0,
  'active'
),
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'cryptowallet.com',
  'Highly valuable domain name for cryptocurrency and digital wallet services.',
  'domain',
  180000,
  0,
  0,
  0,
  0,
  'active'
),
-- SaaS
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'Invoice Management Platform',
  'Complete invoicing and payment tracking solution with 2,000 active business customers. Includes payment processing and accounting integrations.',
  'saas',
  250000,
  18000,
  14500,
  15000,
  85000,
  'active'
),
(
  (SELECT id FROM profiles ORDER BY joined_at ASC LIMIT 1),
  'Social Media Scheduler',
  'Automated social media management platform with 5,000 active users. Supports all major social networks with analytics and AI-powered suggestions.',
  'saas',
  175000,
  12000,
  9500,
  25000,
  120000,
  'active'
);