-- agri_business.sql
-- Kumpletong database + sample data. I-import sa phpMyAdmin (Import tab).
-- BABALA: buburahin nito ang lumang "agri_business" database at gagawa ng bago.
-- Pagkatapos mag-import, i-run sa backend folder: npm run seed  (para magawa ang login accounts)

DROP DATABASE IF EXISTS agri_business;
CREATE DATABASE agri_business CHARACTER SET utf8mb4;
USE agri_business;

-- 4.3.1 Accounts at roles
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','gulayan','prutasan','babuyan') NOT NULL,
  active TINYINT(1) DEFAULT 1
);

-- 2.1 Inventory. category: vegetable, fruit, feed, medicine, vitamin
CREATE TABLE inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department ENUM('gulayan','prutasan','babuyan') NOT NULL,
  category VARCHAR(20) NULL,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  quantity DECIMAL(10,2) DEFAULT 0,
  cost_per_kg DECIMAL(10,2) DEFAULT 0,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  sell_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  low_threshold DECIMAL(10,2) DEFAULT 10
);

-- 2.1.3 In / Out / Spoilage log
CREATE TABLE stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  type ENUM('in','out','spoilage') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  note VARCHAR(255),
  unit_cost DECIMAL(12,2) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id)
);

-- 3.1.1 Pig batches
CREATE TABLE batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_date DATE NOT NULL,
  heads INT NOT NULL,
  capital_cost DECIMAL(12,2) NOT NULL
);

-- 1.1 Sales (batch_id ay para lang sa hog sales ng Babuyan)
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department ENUM('gulayan','prutasan','babuyan') NOT NULL,
  item_id INT NULL,
  batch_id INT NULL,
  product VARCHAR(100) NOT NULL,
  kilos DECIMAL(10,2) NOT NULL,
  price_per_kilo DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'Cash',
  total DECIMAL(12,2) NOT NULL,
  cogs DECIMAL(12,2) DEFAULT 0,
  sold_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Expenses (Admin only)
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department ENUM('gulayan','prutasan','babuyan') NOT NULL,
  batch_id INT NULL,
  category VARCHAR(30) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note VARCHAR(255),
  spent_at DATE NOT NULL
);

-- 4.4.1 Activity log
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  username VARCHAR(50),
  department VARCHAR(20),
  action VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2.1.5 Monthly audit. status: pending -> approved / rejected
CREATE TABLE stock_adjustments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  audit_month VARCHAR(7) NOT NULL,
  item_id INT NOT NULL,
  system_qty DECIMAL(10,2) NOT NULL,
  counted_qty DECIMAL(10,2) NOT NULL,
  difference DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255),
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2.1.6 Feeds / medicine / vitamins na nilabas ng Babuyan staff
CREATE TABLE usage_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  batch_id INT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  released_at DATE NOT NULL,
  recorded_by VARCHAR(50),
  unit_cost DECIMAL(12,2) NULL
);

-- 3.1.2 Weight, vaccination, mortality, water per batch
CREATE TABLE batch_health (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  type ENUM('weight','vaccination','mortality','water') NOT NULL,
  value DECIMAL(10,2) NULL,
  note VARCHAR(255),
  logged_at DATE NOT NULL
);

-- Settings (hal. audit schedule ng bawat department)
CREATE TABLE settings (
  skey VARCHAR(60) PRIMARY KEY,
  svalue VARCHAR(100) NOT NULL
);

-- =====================  SAMPLE DATA  =====================

-- Inventory (1-3 Gulayan, 4-6 Prutasan, 7-10 Babuyan)
INSERT INTO inventory_items (id, department, category, name, unit, quantity, cost_per_kg, low_threshold) VALUES
(1,'gulayan','vegetable','Kangkong','kg',50,25,10),
(2,'gulayan','vegetable','Pechay','kg',48,30,10),
(3,'gulayan','vegetable','Talong','kg',8,40,10),
(4,'prutasan','fruit','Saging','kg',40,35,10),
(5,'prutasan','fruit','Mangga','kg',50,80,10),
(6,'prutasan','fruit','Pakwan','kg',5,20,10),
(7,'babuyan','feed','Starter Feeds','sack',30,1450,5),
(8,'babuyan','feed','Grower Feeds','sack',30,1350,5),
(9,'babuyan','vitamin','Vitamins','bottle',16,350,3),
(10,'babuyan','medicine','Antibiotic','bottle',12,500,3);

-- Stock movements (In / Out / Spoilage)
INSERT INTO stock_movements (item_id, type, quantity, note, created_at) VALUES
(1,'in',100,'Stock in','2026-11-01 07:00:00'),(2,'in',80,'Stock in','2026-11-01 07:00:00'),(3,'in',60,'Stock in','2026-11-01 07:00:00'),
(4,'in',120,'Stock in','2026-11-01 07:30:00'),(5,'in',90,'Stock in','2026-11-01 07:30:00'),(6,'in',50,'Stock in','2026-11-01 07:30:00'),
(7,'in',50,'Stock in','2026-08-01 09:00:00'),(8,'in',40,'Stock in','2026-08-01 09:00:00'),
(9,'in',20,'Stock in','2026-08-01 09:00:00'),(10,'in',15,'Stock in','2026-08-01 09:00:00'),
(1,'out',25,'Sale','2026-11-03 10:00:00'),(1,'out',20,'Sale','2026-11-10 10:00:00'),
(2,'out',30,'Sale','2026-11-05 10:00:00'),(3,'out',52,'Sale','2026-11-12 10:00:00'),
(4,'out',40,'Sale','2026-11-04 10:00:00'),(4,'out',30,'Sale','2026-11-11 10:00:00'),
(5,'out',40,'Sale','2026-11-08 10:00:00'),(6,'out',45,'Sale','2026-11-14 10:00:00'),
(1,'spoilage',5,'Wilted','2026-11-13 16:00:00'),(4,'spoilage',10,'Overripe','2026-11-13 16:00:00'),
(2,'out',2,'Audit adjustment','2026-11-15 17:00:00'),
(7,'out',12,'Usage','2026-09-05 08:00:00'),(7,'out',8,'Usage','2026-10-05 08:00:00'),
(8,'out',10,'Usage','2026-10-20 08:00:00'),(9,'out',4,'Usage','2026-10-25 08:00:00'),(10,'out',3,'Usage','2026-10-25 08:00:00');

-- Pig batches (1 = tapos nang naibenta, 2 at 3 = lumalaki pa)
INSERT INTO batches (id, purchase_date, heads, capital_cost) VALUES
(1,'2026-03-10',15,110000),
(2,'2026-08-01',20,160000),
(3,'2026-10-15',25,200000);

-- Sales (Gulayan, Prutasan, at hog sale ng batch 1)
INSERT INTO sales (department,item_id,batch_id,product,kilos,price_per_kilo,payment_method,total,cogs,sold_at) VALUES
('gulayan',1,NULL,'Kangkong',25,60,'Cash',1500,625,'2026-11-03 10:00:00'),
('gulayan',1,NULL,'Kangkong',20,60,'GCash',1200,500,'2026-11-10 10:00:00'),
('gulayan',2,NULL,'Pechay',30,70,'Cash',2100,900,'2026-11-05 10:00:00'),
('gulayan',3,NULL,'Talong',52,90,'Cash',4680,2080,'2026-11-12 10:00:00'),
('prutasan',4,NULL,'Saging',40,60,'Cash',2400,1400,'2026-11-04 10:00:00'),
('prutasan',4,NULL,'Saging',30,60,'GCash',1800,1050,'2026-11-11 10:00:00'),
('prutasan',5,NULL,'Mangga',40,130,'Cash',5200,3200,'2026-11-08 10:00:00'),
('prutasan',6,NULL,'Pakwan',45,35,'Cash',1575,900,'2026-11-14 10:00:00'),
('babuyan',NULL,1,'Hog (Batch #1)',1500,190,'Bank transfer',285000,0,'2026-07-10 09:00:00');

-- Expenses
INSERT INTO expenses (department,batch_id,category,amount,note,spent_at) VALUES
('gulayan',NULL,'sourcing',1500,'Farm pickup','2026-11-01'),
('gulayan',NULL,'logistics',600,'Delivery','2026-11-02'),
('gulayan',NULL,'labor',2500,'Helpers','2026-11-15'),
('gulayan',NULL,'utilities',400,'Water','2026-11-15'),
('prutasan',NULL,'sourcing',2000,'Supplier','2026-11-01'),
('prutasan',NULL,'storage',800,'Cold storage','2026-11-05'),
('prutasan',NULL,'logistics',700,'Delivery','2026-11-06'),
('prutasan',NULL,'labor',2500,'Helpers','2026-11-15'),
('babuyan',1,'feed',90000,'Batch 1 feeds','2026-06-15'),
('babuyan',1,'veterinary care',8000,'Batch 1 vet','2026-06-20'),
('babuyan',1,'labor',20000,'Batch 1 labor','2026-07-01'),
('babuyan',2,'feed',25000,'Feeds','2026-10-01'),
('babuyan',2,'veterinary care',3000,'Vaccines','2026-10-05'),
('babuyan',2,'labor',4000,'Caretaker','2026-11-01');

-- Usage records ng Babuyan staff (tugma sa inventory)
INSERT INTO usage_records (item_id,batch_id,quantity,released_at,recorded_by) VALUES
(7,2,12,'2026-09-05','babuyan'),(7,2,8,'2026-10-05','babuyan'),
(8,2,10,'2026-10-20','babuyan'),(9,2,4,'2026-10-25','babuyan'),(10,2,3,'2026-10-25','babuyan');

-- Health logs
INSERT INTO batch_health (batch_id,type,value,note,logged_at) VALUES
(1,'weight',100,'','2026-07-01'),
(2,'weight',25,'','2026-09-01'),(2,'weight',45,'','2026-10-01'),(2,'weight',70,'','2026-11-01'),
(2,'vaccination',NULL,'Hog cholera','2026-08-10'),
(2,'mortality',1,'','2026-09-15'),
(2,'water',400,'','2026-11-10');

-- Isang halimbawa ng monthly audit
INSERT INTO stock_adjustments (audit_month,item_id,system_qty,counted_qty,difference,reason,status) VALUES
('2026-11',2,50,48,-2,'Wilted leaves','approved');

-- Ilang activity logs
INSERT INTO activity_logs (username, department, action, created_at) VALUES
('admin','gulayan','Added 100 kg of Kangkong','2026-11-01 07:00:00'),
('admin','prutasan','Added 120 kg of Saging','2026-11-01 07:30:00'),
('admin','babuyan','Added batch of 25 heads','2026-10-15 09:00:00');

-- Audit schedule (araw ng buwan)
INSERT INTO settings (skey, svalue) VALUES
('audit_day_gulayan','25'),('audit_day_prutasan','25'),('audit_day_babuyan','25'),
('audit_last_gulayan','2026-11');

-- Product catalog and illustrative POS prices
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Kangkong','kg',0,25,10,60 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Kangkong' AND is_archived=0);
UPDATE inventory_items SET sell_price=60 WHERE department='gulayan' AND name='Kangkong' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Pechay','kg',0,30,10,70 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Pechay' AND is_archived=0);
UPDATE inventory_items SET sell_price=70 WHERE department='gulayan' AND name='Pechay' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Talong','kg',0,40,10,90 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Talong' AND is_archived=0);
UPDATE inventory_items SET sell_price=90 WHERE department='gulayan' AND name='Talong' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Sitaw','kg',0,55,10,110 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Sitaw' AND is_archived=0);
UPDATE inventory_items SET sell_price=110 WHERE department='gulayan' AND name='Sitaw' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Okra','kg',0,45,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Okra' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='gulayan' AND name='Okra' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Repolyo','kg',0,40,10,85 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Repolyo' AND is_archived=0);
UPDATE inventory_items SET sell_price=85 WHERE department='gulayan' AND name='Repolyo' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Kamatis','kg',0,50,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Kamatis' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='gulayan' AND name='Kamatis' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Sibuyas Pula','kg',0,90,10,160 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Sibuyas Pula' AND is_archived=0);
UPDATE inventory_items SET sell_price=160 WHERE department='gulayan' AND name='Sibuyas Pula' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Sibuyas Puti','kg',0,95,10,170 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Sibuyas Puti' AND is_archived=0);
UPDATE inventory_items SET sell_price=170 WHERE department='gulayan' AND name='Sibuyas Puti' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Bawang','kg',0,170,10,280 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Bawang' AND is_archived=0);
UPDATE inventory_items SET sell_price=280 WHERE department='gulayan' AND name='Bawang' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Patatas','kg',0,65,10,110 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Patatas' AND is_archived=0);
UPDATE inventory_items SET sell_price=110 WHERE department='gulayan' AND name='Patatas' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Kamote','kg',0,35,10,75 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Kamote' AND is_archived=0);
UPDATE inventory_items SET sell_price=75 WHERE department='gulayan' AND name='Kamote' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Kalabasa','kg',0,30,10,65 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Kalabasa' AND is_archived=0);
UPDATE inventory_items SET sell_price=65 WHERE department='gulayan' AND name='Kalabasa' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Sayote','kg',0,30,10,65 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Sayote' AND is_archived=0);
UPDATE inventory_items SET sell_price=65 WHERE department='gulayan' AND name='Sayote' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Ampalaya','kg',0,55,10,120 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Ampalaya' AND is_archived=0);
UPDATE inventory_items SET sell_price=120 WHERE department='gulayan' AND name='Ampalaya' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Upo','kg',0,25,10,60 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Upo' AND is_archived=0);
UPDATE inventory_items SET sell_price=60 WHERE department='gulayan' AND name='Upo' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Patola','kg',0,35,10,85 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Patola' AND is_archived=0);
UPDATE inventory_items SET sell_price=85 WHERE department='gulayan' AND name='Patola' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Labanos','kg',0,35,10,75 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Labanos' AND is_archived=0);
UPDATE inventory_items SET sell_price=75 WHERE department='gulayan' AND name='Labanos' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Carrots','kg',0,70,10,130 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Carrots' AND is_archived=0);
UPDATE inventory_items SET sell_price=130 WHERE department='gulayan' AND name='Carrots' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Pipino','kg',0,30,10,75 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Pipino' AND is_archived=0);
UPDATE inventory_items SET sell_price=75 WHERE department='gulayan' AND name='Pipino' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Luya','kg',0,100,10,190 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Luya' AND is_archived=0);
UPDATE inventory_items SET sell_price=190 WHERE department='gulayan' AND name='Luya' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Siling Haba','kg',0,65,10,140 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Siling Haba' AND is_archived=0);
UPDATE inventory_items SET sell_price=140 WHERE department='gulayan' AND name='Siling Haba' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Siling Labuyo','kg',0,160,10,300 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Siling Labuyo' AND is_archived=0);
UPDATE inventory_items SET sell_price=300 WHERE department='gulayan' AND name='Siling Labuyo' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Malunggay','kg',0,35,10,90 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Malunggay' AND is_archived=0);
UPDATE inventory_items SET sell_price=90 WHERE department='gulayan' AND name='Malunggay' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Mustasa','kg',0,40,10,85 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Mustasa' AND is_archived=0);
UPDATE inventory_items SET sell_price=85 WHERE department='gulayan' AND name='Mustasa' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Alugbati','kg',0,25,10,70 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Alugbati' AND is_archived=0);
UPDATE inventory_items SET sell_price=70 WHERE department='gulayan' AND name='Alugbati' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Saluyot','kg',0,30,10,80 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Saluyot' AND is_archived=0);
UPDATE inventory_items SET sell_price=80 WHERE department='gulayan' AND name='Saluyot' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Talbos ng Kamote','kg',0,25,10,70 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Talbos ng Kamote' AND is_archived=0);
UPDATE inventory_items SET sell_price=70 WHERE department='gulayan' AND name='Talbos ng Kamote' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Broccoli','kg',0,140,10,240 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Broccoli' AND is_archived=0);
UPDATE inventory_items SET sell_price=240 WHERE department='gulayan' AND name='Broccoli' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Cauliflower','kg',0,120,10,210 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Cauliflower' AND is_archived=0);
UPDATE inventory_items SET sell_price=210 WHERE department='gulayan' AND name='Cauliflower' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Lettuce','kg',0,95,10,170 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Lettuce' AND is_archived=0);
UPDATE inventory_items SET sell_price=170 WHERE department='gulayan' AND name='Lettuce' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Baguio Beans','kg',0,80,10,150 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Baguio Beans' AND is_archived=0);
UPDATE inventory_items SET sell_price=150 WHERE department='gulayan' AND name='Baguio Beans' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Green Peas','kg',0,110,10,190 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Green Peas' AND is_archived=0);
UPDATE inventory_items SET sell_price=190 WHERE department='gulayan' AND name='Green Peas' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Mais','kg',0,30,10,65 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Mais' AND is_archived=0);
UPDATE inventory_items SET sell_price=65 WHERE department='gulayan' AND name='Mais' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Singkamas','kg',0,35,10,85 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Singkamas' AND is_archived=0);
UPDATE inventory_items SET sell_price=85 WHERE department='gulayan' AND name='Singkamas' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Gabi','kg',0,50,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Gabi' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='gulayan' AND name='Gabi' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Puso ng Saging','kg',0,35,10,75 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Puso ng Saging' AND is_archived=0);
UPDATE inventory_items SET sell_price=75 WHERE department='gulayan' AND name='Puso ng Saging' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Labong','kg',0,45,10,95 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Labong' AND is_archived=0);
UPDATE inventory_items SET sell_price=95 WHERE department='gulayan' AND name='Labong' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Spring Onion','kg',0,80,10,170 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Spring Onion' AND is_archived=0);
UPDATE inventory_items SET sell_price=170 WHERE department='gulayan' AND name='Spring Onion' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Bell Pepper','kg',0,125,10,230 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Bell Pepper' AND is_archived=0);
UPDATE inventory_items SET sell_price=230 WHERE department='gulayan' AND name='Bell Pepper' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Mushroom','kg',0,110,10,200 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Mushroom' AND is_archived=0);
UPDATE inventory_items SET sell_price=200 WHERE department='gulayan' AND name='Mushroom' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Kintsay','kg',0,100,10,190 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Kintsay' AND is_archived=0);
UPDATE inventory_items SET sell_price=190 WHERE department='gulayan' AND name='Kintsay' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Kinchay','kg',0,80,10,160 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Kinchay' AND is_archived=0);
UPDATE inventory_items SET sell_price=160 WHERE department='gulayan' AND name='Kinchay' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'gulayan','vegetable','Tanglad','kg',0,25,10,70 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='gulayan' AND name='Tanglad' AND is_archived=0);
UPDATE inventory_items SET sell_price=70 WHERE department='gulayan' AND name='Tanglad' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Saging','kg',0,35,10,60 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Saging' AND is_archived=0);
UPDATE inventory_items SET sell_price=60 WHERE department='prutasan' AND name='Saging' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Mangga','kg',0,80,10,130 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Mangga' AND is_archived=0);
UPDATE inventory_items SET sell_price=130 WHERE department='prutasan' AND name='Mangga' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Pakwan','kg',0,20,10,45 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Pakwan' AND is_archived=0);
UPDATE inventory_items SET sell_price=45 WHERE department='prutasan' AND name='Pakwan' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Pinya','kg',0,45,10,85 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Pinya' AND is_archived=0);
UPDATE inventory_items SET sell_price=85 WHERE department='prutasan' AND name='Pinya' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Papaya','kg',0,30,10,70 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Papaya' AND is_archived=0);
UPDATE inventory_items SET sell_price=70 WHERE department='prutasan' AND name='Papaya' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Bayabas','kg',0,40,10,90 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Bayabas' AND is_archived=0);
UPDATE inventory_items SET sell_price=90 WHERE department='prutasan' AND name='Bayabas' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Dalanghita','kg',0,55,10,110 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Dalanghita' AND is_archived=0);
UPDATE inventory_items SET sell_price=110 WHERE department='prutasan' AND name='Dalanghita' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Dalandan','kg',0,50,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Dalandan' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='prutasan' AND name='Dalandan' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Calamansi','kg',0,50,10,110 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Calamansi' AND is_archived=0);
UPDATE inventory_items SET sell_price=110 WHERE department='prutasan' AND name='Calamansi' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Ubas','kg',0,150,10,240 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Ubas' AND is_archived=0);
UPDATE inventory_items SET sell_price=240 WHERE department='prutasan' AND name='Ubas' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Lanzones','kg',0,85,10,160 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Lanzones' AND is_archived=0);
UPDATE inventory_items SET sell_price=160 WHERE department='prutasan' AND name='Lanzones' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Rambutan','kg',0,75,10,150 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Rambutan' AND is_archived=0);
UPDATE inventory_items SET sell_price=150 WHERE department='prutasan' AND name='Rambutan' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Santol','kg',0,30,10,75 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Santol' AND is_archived=0);
UPDATE inventory_items SET sell_price=75 WHERE department='prutasan' AND name='Santol' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Atis','kg',0,75,10,150 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Atis' AND is_archived=0);
UPDATE inventory_items SET sell_price=150 WHERE department='prutasan' AND name='Atis' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Guyabano','kg',0,55,10,120 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Guyabano' AND is_archived=0);
UPDATE inventory_items SET sell_price=120 WHERE department='prutasan' AND name='Guyabano' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Langka','kg',0,45,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Langka' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='prutasan' AND name='Langka' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Durian','kg',0,130,10,230 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Durian' AND is_archived=0);
UPDATE inventory_items SET sell_price=230 WHERE department='prutasan' AND name='Durian' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Mangosteen','kg',0,155,10,260 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Mangosteen' AND is_archived=0);
UPDATE inventory_items SET sell_price=260 WHERE department='prutasan' AND name='Mangosteen' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Dragon Fruit','kg',0,105,10,200 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Dragon Fruit' AND is_archived=0);
UPDATE inventory_items SET sell_price=200 WHERE department='prutasan' AND name='Dragon Fruit' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Melon','kg',0,50,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Melon' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='prutasan' AND name='Melon' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Honeydew','kg',0,75,10,140 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Honeydew' AND is_archived=0);
UPDATE inventory_items SET sell_price=140 WHERE department='prutasan' AND name='Honeydew' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Apple','kg',0,100,10,180 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Apple' AND is_archived=0);
UPDATE inventory_items SET sell_price=180 WHERE department='prutasan' AND name='Apple' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Orange','kg',0,85,10,160 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Orange' AND is_archived=0);
UPDATE inventory_items SET sell_price=160 WHERE department='prutasan' AND name='Orange' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Peras','kg',0,95,10,180 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Peras' AND is_archived=0);
UPDATE inventory_items SET sell_price=180 WHERE department='prutasan' AND name='Peras' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Kiwi','kg',0,190,10,320 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Kiwi' AND is_archived=0);
UPDATE inventory_items SET sell_price=320 WHERE department='prutasan' AND name='Kiwi' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Strawberry','kg',0,220,10,350 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Strawberry' AND is_archived=0);
UPDATE inventory_items SET sell_price=350 WHERE department='prutasan' AND name='Strawberry' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Avocado','kg',0,95,10,180 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Avocado' AND is_archived=0);
UPDATE inventory_items SET sell_price=180 WHERE department='prutasan' AND name='Avocado' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Chico','kg',0,60,10,130 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Chico' AND is_archived=0);
UPDATE inventory_items SET sell_price=130 WHERE department='prutasan' AND name='Chico' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Star Apple','kg',0,50,10,110 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Star Apple' AND is_archived=0);
UPDATE inventory_items SET sell_price=110 WHERE department='prutasan' AND name='Star Apple' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Marang','kg',0,80,10,160 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Marang' AND is_archived=0);
UPDATE inventory_items SET sell_price=160 WHERE department='prutasan' AND name='Marang' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Pomelo','kg',0,70,10,140 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Pomelo' AND is_archived=0);
UPDATE inventory_items SET sell_price=140 WHERE department='prutasan' AND name='Pomelo' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Sampalok','kg',0,45,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Sampalok' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='prutasan' AND name='Sampalok' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Macopa','kg',0,40,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Macopa' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='prutasan' AND name='Macopa' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Duhat','kg',0,60,10,140 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Duhat' AND is_archived=0);
UPDATE inventory_items SET sell_price=140 WHERE department='prutasan' AND name='Duhat' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Balimbing','kg',0,45,10,100 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Balimbing' AND is_archived=0);
UPDATE inventory_items SET sell_price=100 WHERE department='prutasan' AND name='Balimbing' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Passion Fruit','kg',0,110,10,210 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Passion Fruit' AND is_archived=0);
UPDATE inventory_items SET sell_price=210 WHERE department='prutasan' AND name='Passion Fruit' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;
INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) SELECT 'prutasan','fruit','Buko','kg',0,30,10,65 WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE department='prutasan' AND name='Buko' AND is_archived=0);
UPDATE inventory_items SET sell_price=65 WHERE department='prutasan' AND name='Buko' AND (sell_price IS NULL OR sell_price=0) AND is_archived=0;

-- Demo opening stock for catalog items with no initial inventory.
INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost)
SELECT id,'in',25,'Demo opening stock',cost_per_kg FROM inventory_items
WHERE department IN ('gulayan','prutasan') AND quantity=0 AND is_archived=0;
UPDATE inventory_items SET quantity=25 WHERE department IN ('gulayan','prutasan') AND quantity=0 AND is_archived=0;
