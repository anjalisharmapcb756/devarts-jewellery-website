-- Seed data for Vara (24 products, categories, gemstones, metals, options, images, reviews)
-- Execute after 002_rls.sql. Safe to re-run for slugs/unique keys where ON CONFLICT is used.

begin;

-- Categories
insert into public.categories (slug, name, description, display_order) values
  ('rings', 'Rings', 'Signature solitaires and bands', 1),
  ('earrings', 'Earrings', 'Elegant drops and studs', 2),
  ('necklaces', 'Necklaces', 'Pendants with quiet brilliance', 3),
  ('bracelets', 'Bracelets', 'Refined everyday radiance', 4),
  ('engagement-rings', 'Engagement Rings', 'Engagement rings designed to last forever', 5),
  ('wedding-jewellery', 'Wedding Jewellery', 'Heirloom-worthy wedding jewellery', 6),
  ('mens-jewellery', 'Men''s Jewellery', 'Bold, refined jewellery for the modern gentleman', 7)
on conflict (slug) do update set name = excluded.name, description = excluded.description, display_order = excluded.display_order;

-- Gemstones
insert into public.gemstones (slug, name) values
  ('diamond', 'Diamond'),
  ('emerald', 'Emerald'),
  ('ruby', 'Ruby'),
  ('sapphire', 'Sapphire'),
  ('pearl', 'Pearl')
on conflict (slug) do update set name = excluded.name;

-- Metal variants
insert into public.metal_variants (slug, name, purity) values
  ('yellow-gold', 'Yellow Gold', '18K'),
  ('white-gold', 'White Gold', '18K'),
  ('rose-gold', 'Rose Gold', '18K'),
  ('platinum', 'Platinum', '950')
on conflict (slug) do update set name = excluded.name, purity = excluded.purity;

-- Products
with cat as (select id, slug from public.categories),
     gem as (select id, slug from public.gemstones),
     met as (select id, slug from public.metal_variants)
insert into public.products (
  slug, name, description, details, category_id, default_gemstone_id, default_metal_id,
  occasion, price_inr, original_price_inr, sku, stock_quantity, badge, rating, review_count,
  metal_purity, metal_weight, gemstone_weight, gemstone_quality, setting, certification, shipping_info, return_policy
) values
('aurora-diamond-ring','Aurora Diamond Ring','A radiant diamond solitaire set in warm yellow gold.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='rings'),(select id from gem where slug='diamond'),(select id from met where slug='yellow-gold'),'Anniversary',89500,105000,'AUR-RNG-001',12,'Bestseller',4.8,124,'18K','3.20 g','0.50 ct','VS1','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('celeste-pearl-pendant','Celeste Pearl Pendant','A luminous pearl pendant with refined gold detailing.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='necklaces'),(select id from gem where slug='pearl'),(select id from met where slug='yellow-gold'),'Everyday',64500,null,'AUR-NCK-001',10,null,4.7,86,'18K','4.10 g','7.00 mm','AAA','Bezel','Vara Authenticity Certificate','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('lumiere-drop-earrings','Lumière Drop Earrings','Elegant diamond drops designed for graceful evening wear.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='earrings'),(select id from gem where slug='diamond'),(select id from met where slug='white-gold'),'Gifting',72500,82000,'AUR-EAR-001',9,'New',4.9,52,'18K','3.80 g','0.60 ct','VS2','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('etoile-gold-bracelet','Étoile Gold Bracelet','A delicate bracelet crafted in polished yellow gold.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='bracelets'),(select id from gem where slug='diamond'),(select id from met where slug='yellow-gold'),'Everyday',56800,null,'AUR-BRC-001',15,null,4.6,41,'18K','5.40 g','0.20 ct','SI1','Channel','Vara Authenticity Certificate','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('noor-emerald-ring','Noor Emerald Ring','A vivid emerald centrepiece framed by fine diamonds.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='rings'),(select id from gem where slug='emerald'),(select id from met where slug='yellow-gold'),'Wedding',112000,128000,'AUR-RNG-002',7,null,4.8,63,'18K','3.60 g','1.10 ct','Natural','Halo','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('solene-sapphire-necklace','Solène Sapphire Necklace','A deep blue sapphire pendant with a luxurious finish.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='necklaces'),(select id from gem where slug='sapphire'),(select id from met where slug='white-gold'),'Anniversary',134000,null,'AUR-NCK-002',6,'Exclusive',4.9,38,'18K','4.50 g','1.20 ct','Natural','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('amour-ruby-earrings','Amour Ruby Earrings','Rich ruby studs crafted for bold yet refined beauty.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='earrings'),(select id from gem where slug='ruby'),(select id from met where slug='rose-gold'),'Gifting',98500,115000,'AUR-EAR-002',8,null,4.7,47,'18K','3.10 g','0.90 ct','Natural','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('heritage-diamond-bracelet','Heritage Diamond Bracelet','A timeless diamond bracelet with heirloom appeal.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='bracelets'),(select id from gem where slug='diamond'),(select id from met where slug='white-gold'),'Wedding',149000,null,'AUR-BRC-002',5,'Bestseller',4.9,71,'18K','7.20 g','1.50 ct','VS1','Channel','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('eternelle-solitaire-ring','Éternelle Solitaire Ring','A classic solitaire engagement ring with exceptional brilliance.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='engagement-rings'),(select id from gem where slug='diamond'),(select id from met where slug='platinum'),'Wedding',245000,275000,'AUR-ENG-001',4,'Signature',4.9,102,'950 Platinum','4.80 g','1.00 ct','VVS2','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('vow-diamond-band','Vow Diamond Band','A wedding band with pavé diamonds and refined comfort.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='wedding-jewellery'),(select id from gem where slug='diamond'),(select id from met where slug='yellow-gold'),'Wedding',78500,null,'AUR-WED-001',11,null,4.7,33,'18K','3.90 g','0.40 ct','VS2','Pavé','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('regal-onyx-cufflinks','Regal Onyx Cufflinks','Sophisticated men''s cufflinks with a bold onyx inlay.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='mens-jewellery'),(select id from gem where slug='diamond'),(select id from met where slug='white-gold'),'Gifting',42500,null,'AUR-MEN-001',14,'New',4.5,19,'18K','8.10 g','0.10 ct','SI1','Bezel','Vara Authenticity Certificate','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('imperial-gold-chain','Imperial Gold Chain','A substantial gold chain crafted for distinguished style.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='mens-jewellery'),(select id from gem where slug='diamond'),(select id from met where slug='yellow-gold'),'Everyday',158000,175000,'AUR-MEN-002',6,null,4.6,28,'22K','15.60 g','—','—','—','BIS Hallmarked','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('rose-halo-ring','Rosé Halo Ring','A romantic rose gold halo ring with diamond sparkle.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='rings'),(select id from gem where slug='diamond'),(select id from met where slug='rose-gold'),'Anniversary',96500,null,'AUR-RNG-003',9,null,4.8,58,'18K','3.40 g','0.65 ct','VS1','Halo','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('opaline-pearl-studs','Opaline Pearl Studs','Classic pearl studs with a soft, luminous glow.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='earrings'),(select id from gem where slug='pearl'),(select id from met where slug='yellow-gold'),'Everyday',38500,null,'AUR-EAR-003',18,null,4.7,64,'18K','2.60 g','6.50 mm','AAA','Bezel','Vara Authenticity Certificate','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('azure-sapphire-ring','Azure Sapphire Ring','A striking sapphire ring set in cool white gold.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='rings'),(select id from gem where slug='sapphire'),(select id from met where slug='white-gold'),'Gifting',124000,139000,'AUR-RNG-004',5,null,4.8,44,'18K','3.70 g','1.30 ct','Natural','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('petite-diamond-pendant','Petite Diamond Pendant','A delicate diamond pendant for effortless everyday luxury.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='necklaces'),(select id from gem where slug='diamond'),(select id from met where slug='rose-gold'),'Everyday',52500,null,'AUR-NCK-003',13,'Bestseller',4.8,91,'18K','2.90 g','0.25 ct','VS2','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('verdant-emerald-earrings','Verdant Emerald Earrings','Emerald drop earrings with captivating depth and colour.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='earrings'),(select id from gem where slug='emerald'),(select id from met where slug='yellow-gold'),'Wedding',118000,null,'AUR-EAR-004',6,'Exclusive',4.9,36,'18K','4.20 g','1.40 ct','Natural','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('seraphine-tennis-bracelet','Seraphine Tennis Bracelet','A luminous diamond tennis bracelet with graceful movement.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='bracelets'),(select id from gem where slug='diamond'),(select id from met where slug='white-gold'),'Anniversary',198000,225000,'AUR-BRC-003',4,null,4.9,57,'18K','9.10 g','2.20 ct','VS1','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('crimson-ruby-pendant','Crimson Ruby Pendant','A passionate ruby pendant set in warm yellow gold.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='necklaces'),(select id from gem where slug='ruby'),(select id from met where slug='yellow-gold'),'Gifting',88500,null,'AUR-NCK-004',8,null,4.7,39,'18K','3.80 g','0.95 ct','Natural','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('aurelia-wedding-band','Aurelia Wedding Band','A graceful wedding band designed to pair beautifully.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='wedding-jewellery'),(select id from gem where slug='diamond'),(select id from met where slug='rose-gold'),'Wedding',68500,null,'AUR-WED-002',10,null,4.8,26,'18K','3.30 g','0.30 ct','VS2','Pavé','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('titan-mens-ring','Titan Men''s Ring','A bold platinum men''s ring with diamond accents.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='mens-jewellery'),(select id from gem where slug='diamond'),(select id from met where slug='platinum'),'Gifting',92500,105000,'AUR-MEN-003',7,null,4.6,22,'950 Platinum','7.80 g','0.35 ct','VS2','Channel','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('moonlit-pearl-ring','Moonlit Pearl Ring','An elegant pearl ring with a soft contemporary silhouette.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='rings'),(select id from gem where slug='pearl'),(select id from met where slug='white-gold'),'Everyday',74500,null,'AUR-RNG-005',11,'New',4.7,31,'18K','3.10 g','8.00 mm','AAA','Bezel','Vara Authenticity Certificate','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('celestia-halo-engagement-ring','Celestia Halo Engagement Ring','A breathtaking halo engagement ring with radiant presence.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='engagement-rings'),(select id from gem where slug='diamond'),(select id from met where slug='white-gold'),'Wedding',285000,320000,'AUR-ENG-002',3,'Signature',5.0,74,'18K','4.60 g','1.50 ct','VVS1','Halo','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.'),
('gilded-ruby-bracelet','Gilded Ruby Bracelet','A luxurious ruby bracelet with warm gold accents.','Crafted by Vara artisans, this piece balances timeless elegance with modern refinement.',(select id from cat where slug='bracelets'),(select id from gem where slug='ruby'),(select id from met where slug='yellow-gold'),'Anniversary',136000,null,'AUR-BRC-004',5,null,4.8,29,'18K','8.40 g','1.60 ct','Natural','Prong','IGI Certified','Complimentary insured shipping across India. Delivery in 5-7 business days.','30-day returns on unworn jewellery with original certification.')
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, details = excluded.details,
  category_id = excluded.category_id, default_gemstone_id = excluded.default_gemstone_id, default_metal_id = excluded.default_metal_id,
  occasion = excluded.occasion, price_inr = excluded.price_inr, original_price_inr = excluded.original_price_inr,
  sku = excluded.sku, stock_quantity = excluded.stock_quantity, badge = excluded.badge,
  rating = excluded.rating, review_count = excluded.review_count,
  metal_purity = excluded.metal_purity, metal_weight = excluded.metal_weight, gemstone_weight = excluded.gemstone_weight,
  gemstone_quality = excluded.gemstone_quality, setting = excluded.setting, certification = excluded.certification,
  shipping_info = excluded.shipping_info, return_policy = excluded.return_policy;

-- Product images (primary + hover/gallery)
insert into public.product_images (product_id, url, alt_text, sort_order, is_primary, is_hover)
select p.id, v.url, p.name || ' image ' || v.sort_order::text, v.sort_order, v.is_primary, v.is_hover
from public.products p
join (values
  ('aurora-diamond-ring','/images/references/1.jpg',0,true,false),('aurora-diamond-ring','/images/references/7.jpg',1,false,true),('aurora-diamond-ring','/images/references/6.jpg',2,false,false),('aurora-diamond-ring','/images/references/10.jpg',3,false,false),
  ('celeste-pearl-pendant','/images/references/2.jpg',0,true,false),('celeste-pearl-pendant','/images/references/12.jpg',1,false,true),('celeste-pearl-pendant','/images/references/7.jpg',2,false,false),
  ('lumiere-drop-earrings','/images/references/3.jpg',0,true,false),('lumiere-drop-earrings','/images/references/8.jpg',1,false,true),('lumiere-drop-earrings','/images/references/11.jpg',2,false,false),
  ('etoile-gold-bracelet','/images/references/4.jpg',0,true,false),('etoile-gold-bracelet','/images/references/9.jpg',1,false,true),('etoile-gold-bracelet','/images/references/6.jpg',2,false,false),
  ('noor-emerald-ring','/images/references/10.jpg',0,true,false),('noor-emerald-ring','/images/references/6.jpg',1,false,true),('noor-emerald-ring','/images/references/1.jpg',2,false,false),
  ('solene-sapphire-necklace','/images/references/7.jpg',0,true,false),('solene-sapphire-necklace','/images/references/2.jpg',1,false,true),('solene-sapphire-necklace','/images/references/12.jpg',2,false,false),
  ('amour-ruby-earrings','/images/references/8.jpg',0,true,false),('amour-ruby-earrings','/images/references/3.jpg',1,false,true),('amour-ruby-earrings','/images/references/11.jpg',2,false,false),
  ('heritage-diamond-bracelet','/images/references/9.jpg',0,true,false),('heritage-diamond-bracelet','/images/references/4.jpg',1,false,true),('heritage-diamond-bracelet','/images/references/6.jpg',2,false,false),
  ('eternelle-solitaire-ring','/images/references/6.jpg',0,true,false),('eternelle-solitaire-ring','/images/references/1.jpg',1,false,true),('eternelle-solitaire-ring','/images/references/11.jpg',2,false,false),
  ('vow-diamond-band','/images/references/11.jpg',0,true,false),('vow-diamond-band','/images/references/6.jpg',1,false,true),('vow-diamond-band','/images/references/1.jpg',2,false,false),
  ('regal-onyx-cufflinks','/images/references/5.jpg',0,true,false),('regal-onyx-cufflinks','/images/references/9.jpg',1,false,true),
  ('imperial-gold-chain','/images/references/12.jpg',0,true,false),('imperial-gold-chain','/images/references/5.jpg',1,false,true),
  ('rose-halo-ring','/images/references/1.jpg',0,true,false),('rose-halo-ring','/images/references/10.jpg',1,false,true),('rose-halo-ring','/images/references/6.jpg',2,false,false),
  ('opaline-pearl-studs','/images/references/3.jpg',0,true,false),('opaline-pearl-studs','/images/references/8.jpg',1,false,true),
  ('azure-sapphire-ring','/images/references/7.jpg',0,true,false),('azure-sapphire-ring','/images/references/1.jpg',1,false,true),('azure-sapphire-ring','/images/references/10.jpg',2,false,false),
  ('petite-diamond-pendant','/images/references/2.jpg',0,true,false),('petite-diamond-pendant','/images/references/7.jpg',1,false,true),
  ('verdant-emerald-earrings','/images/references/10.jpg',0,true,false),('verdant-emerald-earrings','/images/references/8.jpg',1,false,true),
  ('seraphine-tennis-bracelet','/images/references/9.jpg',0,true,false),('seraphine-tennis-bracelet','/images/references/4.jpg',1,false,true),('seraphine-tennis-bracelet','/images/references/6.jpg',2,false,false),
  ('crimson-ruby-pendant','/images/references/8.jpg',0,true,false),('crimson-ruby-pendant','/images/references/2.jpg',1,false,true),
  ('aurelia-wedding-band','/images/references/11.jpg',0,true,false),('aurelia-wedding-band','/images/references/1.jpg',1,false,true),
  ('titan-mens-ring','/images/references/5.jpg',0,true,false),('titan-mens-ring','/images/references/12.jpg',1,false,true),
  ('moonlit-pearl-ring','/images/references/12.jpg',0,true,false),('moonlit-pearl-ring','/images/references/1.jpg',1,false,true),
  ('celestia-halo-engagement-ring','/images/references/6.jpg',0,true,false),('celestia-halo-engagement-ring','/images/references/11.jpg',1,false,true),('celestia-halo-engagement-ring','/images/references/1.jpg',2,false,false),
  ('gilded-ruby-bracelet','/images/references/8.jpg',0,true,false),('gilded-ruby-bracelet','/images/references/9.jpg',1,false,true)
) as v(slug, url, sort_order, is_primary, is_hover) on p.slug = v.slug
on conflict do nothing;

-- Customization options (default set for all products; price deltas aligned to frontend pricing behavior)
insert into public.product_customization_options (product_id, option_type, label, value_key, metal_variant_id, price_delta_inr, sort_order, is_default)
select p.id, 'metal', mv.name, mv.slug, mv.id,
  case mv.slug when 'yellow-gold' then 0 when 'white-gold' then 2500 when 'rose-gold' then 2000 when 'platinum' then 18000 else 0 end,
  case mv.slug when 'yellow-gold' then 1 when 'white-gold' then 2 when 'rose-gold' then 3 when 'platinum' then 4 else 99 end,
  (mv.slug = 'yellow-gold')
from public.products p cross join public.metal_variants mv
on conflict (product_id, option_type, value_key) do update set label=excluded.label, price_delta_inr=excluded.price_delta_inr, sort_order=excluded.sort_order, is_default=excluded.is_default;

insert into public.product_customization_options (product_id, option_type, label, value_key, gemstone_id, price_delta_inr, sort_order, is_default)
select p.id, 'gemstone', g.name, g.slug, g.id,
  case g.slug when 'diamond' then 0 when 'emerald' then 6000 when 'ruby' then 5500 when 'sapphire' then 5000 when 'pearl' then (-8000) else 0 end,
  case g.slug when 'diamond' then 1 when 'emerald' then 2 when 'ruby' then 3 when 'sapphire' then 4 when 'pearl' then 5 else 99 end,
  (g.slug = case when p.default_gemstone_id = g.id then g.slug else '' end)
from public.products p cross join public.gemstones g
on conflict (product_id, option_type, value_key) do update set label=excluded.label, price_delta_inr=excluded.price_delta_inr, sort_order=excluded.sort_order;

-- Set gemstone default to product default_gemstone
update public.product_customization_options o
set is_default = (o.gemstone_id = p.default_gemstone_id)
from public.products p
where o.product_id = p.id and o.option_type = 'gemstone';

-- Gemstone sizes
insert into public.product_customization_options (product_id, option_type, label, value_key, price_delta_inr, sort_order, is_default)
select p.id, 'gemstone_size', s.label, s.key, s.delta, s.ord, s.ord = 2
from public.products p
cross join (values ('0.50 ct','0.50-ct',(-12000),1),('1.00 ct','1.00-ct',0,2),('1.50 ct','1.50-ct',18000,3),('2.00 ct','2.00-ct',36000,4)) as s(label,key,delta,ord)
on conflict (product_id, option_type, value_key) do update set label=excluded.label, price_delta_inr=excluded.price_delta_inr, sort_order=excluded.sort_order, is_default=excluded.is_default;

-- Ring sizes for ring categories
insert into public.product_customization_options (product_id, option_type, label, value_key, price_delta_inr, sort_order, is_default)
select p.id, 'ring_size', s.label, s.key, 0, s.ord, s.label = 'US 7'
from public.products p
join public.categories c on c.id = p.category_id
cross join (values ('US 5','us-5',1),('US 6','us-6',2),('US 7','us-7',3),('US 8','us-8',4),('US 9','us-9',5)) as s(label,key,ord)
where c.slug in ('rings','engagement-rings')
on conflict (product_id, option_type, value_key) do update set label=excluded.label, sort_order=excluded.sort_order, is_default=excluded.is_default;

commit;
