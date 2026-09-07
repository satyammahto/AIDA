export interface PresetDataset {
  id: string;
  name: string;
  domain: string;
  description: string;
  csvData: string;
}

export const PRESET_DATASETS: PresetDataset[] = [
  {
    id: "ecommerce-sales",
    name: "Global Retail & E-Commerce Sales",
    domain: "Sales & Retail Operations",
    description: "Multi-regional transaction ledger with order dates, pricing, discounts, profits, and customer segments.",
    csvData: `Order_ID,Order_Date,Region,Product_Category,Customer_Segment,Units_Sold,Unit_Price,Discount_Rate,Revenue,Profit
ORD-1001,2024-01-05,North America,Technology,Corporate,5,$450.00,5%,$2137.50,$640.00
ORD-1002,2024-01-08,Europe,Furniture,Consumer,2,$180.00,0%,$360.00,$75.00
ORD-1003,2024-01-12,Asia Pacific,Office Supplies,Home Office,12,$15.50,10%,$167.40,$42.00
ORD-1004,2024-01-15,North America,Technology,Corporate,8,$720.00,15%,$4896.00,$1450.00
ORD-1005,2024-01-19,Latin America,Furniture,Consumer,1,$850.00,20%,$680.00,-$45.00
ORD-1006,2024-01-22,Europe,Technology,Corporate,4,$520.00,5%,$1976.00,$580.00
ORD-1007,2024-01-25,Asia Pacific,Office Supplies,Consumer,25,$8.00,0%,$200.00,$60.00
ORD-1008,2024-01-29,North America,Furniture,Home Office,3,$310.00,8%,$855.60,$180.00
ORD-1009,2024-02-02,Europe,Office Supplies,Corporate,18,$22.00,12%,$348.48,$92.00
ORD-1010,2024-02-06,Asia Pacific,Technology,Consumer,2,$1200.00,5%,$2280.00,$720.00
ORD-1011,2024-02-10,North America,Technology,Corporate,10,$650.00,10%,$5850.00,$1820.00
ORD-1012,2024-02-14,Europe,Furniture,Home Office,4,$420.00,15%,$1428.00,$210.00
ORD-1013,2024-02-17,Latin America,Office Supplies,Consumer,30,$12.00,5%,$342.00,$85.00
ORD-1014,2024-02-21,North America,Office Supplies,Corporate,15,$35.00,0%,$525.00,$160.00
ORD-1015,2024-02-25,Europe,Technology,Consumer,3,$890.00,20%,$2136.00,$480.00
ORD-1016,2024-03-01,Asia Pacific,Furniture,Corporate,6,$290.00,10%,$1566.00,$310.00
ORD-1017,2024-03-05,North America,Technology,Consumer,7,$410.00,5%,$2726.50,$810.00
ORD-1018,2024-03-09,Europe,Office Supplies,Home Office,40,$6.50,15%,$221.00,$55.00
ORD-1019,2024-03-14,Asia Pacific,Technology,Corporate,9,$550.00,0%,$4950.00,$1580.00
ORD-1020,2024-03-18,North America,Furniture,Consumer,2,$950.00,25%,$1425.00,-$80.00
ORD-1021,2024-03-22,Europe,Technology,Corporate,6,$480.00,5%,$2736.00,$840.00
ORD-1022,2024-03-26,Latin America,Technology,Consumer,1,$1450.00,10%,$1305.00,$390.00
ORD-1023,2024-03-30,Asia Pacific,Office Supplies,Corporate,22,$18.00,8%,$364.32,$98.00
ORD-1024,2024-04-03,North America,Furniture,Home Office,5,$340.00,0%,$1700.00,$380.00
ORD-1025,2024-04-07,Europe,Office Supplies,Consumer,14,$28.00,5%,$372.40,$110.00
ORD-1026,2024-04-11,North America,Technology,Corporate,12,$800.00,10%,$8640.00,$2850.00
ORD-1027,2024-04-15,Asia Pacific,Technology,Consumer,4,$610.00,15%,$2074.00,$520.00
ORD-1028,2024-04-19,Europe,Furniture,Consumer,3,$580.00,20%,$1392.00,$190.00
ORD-1029,2024-04-24,North America,Office Supplies,Home Office,35,$9.00,0%,$315.00,$95.00
ORD-1030,2024-04-28,Latin America,Technology,Corporate,8,$720.00,5%,$5472.00,$1650.00
ORD-1031,2024-05-02,Europe,Technology,Corporate,5,$640.00,8%,$2944.00,$890.00
ORD-1032,2024-05-06,North America,Furniture,Consumer,4,$450.00,15%,$1530.00,$240.00
ORD-1033,2024-05-10,Asia Pacific,Office Supplies,Home Office,50,$5.00,10%,$225.00,$62.00
ORD-1034,2024-05-15,North America,Technology,Corporate,14,$950.00,12%,$11704.00,$3680.00
ORD-1035,2024-05-19,Europe,Office Supplies,Consumer,16,$32.00,0%,$512.00,$155.00
ORD-1011,2024-02-10,North America,Technology,Corporate,10,$650.00,10%,$5850.00,$1820.00
ORD-1036,2024-05-23,Latin America,Furniture,Home Office,,$390.00,5%,$370.50,$65.00
ORD-1037,2024-05-27,Asia Pacific,Technology,Consumer,6,$480.00,,$2880.00,$780.00`,
  },
  {
    id: "clinical-health",
    name: "Healthcare & Patient Clinical Outcomes",
    domain: "Healthcare & Medicine",
    description: "Inpatient hospital registry with admission dates, vital stats, diagnostic categories, length of stay, and treatment costs.",
    csvData: `Patient_ID,Admission_Date,Gender,Age,Blood_Pressure_Sys,Cholesterol_MgDl,Primary_Diagnosis,Hospital_Stay_Days,Treatment_Cost
PT-2001,2024-01-04,Female,58,138,225,Cardiovascular,4,$7850.00
PT-2002,2024-01-07,Male,67,152,260,Cardiovascular,9,$16400.00
PT-2003,2024-01-11,Female,34,118,175,Respiratory,2,$3200.00
PT-2004,2024-01-14,Male,72,165,285,Cardiovascular,14,$28900.00
PT-2005,2024-01-18,Female,45,124,195,Orthopedic,3,$8900.00
PT-2006,2024-01-22,Male,51,142,230,Neurological,6,$14200.00
PT-2007,2024-01-26,Female,63,148,245,Cardiovascular,7,$13500.00
PT-2008,2024-01-30,Male,29,120,165,Respiratory,2,$2800.00
PT-2009,2024-02-03,Female,79,158,210,Neurological,11,$22400.00
PT-2010,2024-02-07,Male,42,130,205,Orthopedic,4,$11200.00
PT-2011,2024-02-12,Female,56,136,238,Cardiovascular,5,$9600.00
PT-2012,2024-02-16,Male,69,160,270,Cardiovascular,12,$24800.00
PT-2013,2024-02-20,Female,38,115,180,Respiratory,3,$4100.00
PT-2014,2024-02-24,Male,84,170,295,Cardiovascular,18,$36500.00
PT-2015,2024-02-28,Female,49,128,190,Orthopedic,5,$10500.00
PT-2016,2024-03-04,Male,61,146,252,Neurological,8,$17900.00
PT-2017,2024-03-08,Female,74,154,235,Cardiovascular,9,$18200.00
PT-2018,2024-03-13,Male,31,122,170,Respiratory,2,$3100.00
PT-2019,2024-03-17,Female,81,162,220,Neurological,13,$26100.00
PT-2020,2024-03-21,Male,46,134,215,Orthopedic,4,$9800.00
PT-2021,2024-03-25,Female,53,132,228,Cardiovascular,5,$9200.00
PT-2022,2024-03-29,Male,65,156,265,Cardiovascular,10,$21400.00
PT-2023,2024-04-02,Female,36,116,185,Respiratory,2,$3400.00
PT-2024,2024-04-06,Male,77,168,290,Cardiovascular,16,$32800.00
PT-2025,2024-04-10,Female,52,126,192,Orthopedic,3,$8700.00
PT-2026,2024-04-14,Male,64,150,248,Neurological,7,$16300.00
PT-2027,2024-04-19,Female,71,152,240,Cardiovascular,8,$16800.00
PT-2028,2024-04-23,Male,28,119,160,Respiratory,1,$2200.00
PT-2029,2024-04-27,Female,83,164,218,Neurological,15,$29800.00
PT-2030,2024-05-01,Male,48,138,222,Orthopedic,5,$12100.00
PT-2005,2024-01-18,Female,45,124,195,Orthopedic,3,$8900.00
PT-2031,2024-05-05,Female,60,,232,Cardiovascular,6,$11500.00
PT-2032,2024-05-09,Male,68,155,,Cardiovascular,11,$23100.00`,
  },
  {
    id: "marketing-performance",
    name: "Omnichannel Digital Marketing Performance",
    domain: "Marketing & Growth Analytics",
    description: "Paid acquisition campaign metrics tracking ad spend, clicks, impressions, conversions, and attribution revenue.",
    csvData: `Campaign_ID,Date,Channel,Ad_Type,Impressions,Clicks,Ad_Spend,Conversions,Revenue_Attributed
CMP-501,2024-01-02,Google Search,Search Ads,45200,1850,$1240.00,92,$4850.00
CMP-502,2024-01-05,Meta Ads,Video Reel,88400,2410,$1820.00,74,$3920.00
CMP-503,2024-01-09,LinkedIn,Sponsored Post,22100,520,$1650.00,38,$5400.00
CMP-504,2024-01-13,TikTok,In-Feed Video,145000,4200,$2100.00,115,$5120.00
CMP-505,2024-01-17,Google Search,Search Ads,52100,2140,$1410.00,108,$5900.00
CMP-506,2024-01-21,YouTube,Bumper Ad,112000,1650,$1550.00,42,$2450.00
CMP-507,2024-01-25,Meta Ads,Carousel,76500,2890,$1950.00,98,$5240.00
CMP-508,2024-01-29,LinkedIn,Lead Gen Form,18900,480,$1780.00,45,$6200.00
CMP-509,2024-02-02,TikTok,TopView,198000,5600,$2850.00,142,$6850.00
CMP-510,2024-02-06,Google Search,Shopping,64000,3100,$2150.00,165,$9200.00
CMP-511,2024-02-10,Meta Ads,Story Ad,92000,2750,$1880.00,85,$4350.00
CMP-512,2024-02-14,YouTube,TrueView,134000,1920,$1720.00,51,$3100.00
CMP-513,2024-02-18,Google Search,Search Ads,48500,1980,$1320.00,102,$5420.00
CMP-514,2024-02-22,LinkedIn,Sponsored InMail,15400,390,$1520.00,34,$4900.00
CMP-515,2024-02-26,TikTok,In-Feed Video,162000,4750,$2340.00,128,$5980.00
CMP-516,2024-03-02,Meta Ads,Feed Image,81000,2620,$1790.00,89,$4760.00
CMP-517,2024-03-06,Google Search,Shopping,71500,3450,$2420.00,184,$10400.00
CMP-518,2024-03-10,YouTube,Bumper Ad,125000,1780,$1640.00,46,$2750.00
CMP-519,2024-03-14,LinkedIn,Sponsored Post,24500,580,$1820.00,41,$5850.00
CMP-520,2024-03-18,TikTok,Spark Ad,175000,5120,$2580.00,136,$6420.00
CMP-521,2024-03-22,Meta Ads,Video Reel,96000,2950,$2040.00,94,$4980.00
CMP-522,2024-03-26,Google Search,Search Ads,55200,2280,$1560.00,116,$6340.00
CMP-523,2024-03-30,YouTube,Non-Skip Video,108000,1490,$1480.00,39,$2380.00
CMP-524,2024-04-03,LinkedIn,Lead Gen Form,21000,510,$1900.00,48,$6800.00
CMP-525,2024-04-07,TikTok,In-Feed Video,184000,5400,$2720.00,148,$7150.00
CMP-526,2024-04-11,Meta Ads,Carousel,84500,2810,$1920.00,92,$5100.00
CMP-527,2024-04-15,Google Search,Shopping,79000,3850,$2680.00,205,$11800.00
CMP-528,2024-04-19,YouTube,TrueView,142000,2080,$1850.00,56,$3450.00
CMP-529,2024-04-23,LinkedIn,Sponsored Post,26200,620,$1980.00,44,$6250.00
CMP-530,2024-04-27,TikTok,TopView,215000,6200,$3150.00,162,$7820.00
CMP-505,2024-01-17,Google Search,Search Ads,52100,2140,$1410.00,108,$5900.00
CMP-531,2024-05-01,Meta Ads,Story Ad,99500,3050,$2180.00,,$5350.00
CMP-532,2024-05-05,Google Search,Search Ads,58000,2390,,122,$6700.00`,
  },
  {
    id: "workforce-attrition",
    name: "Enterprise Workforce & People Analytics",
    domain: "Human Resources & Talent",
    description: "Employee demographics, satisfaction scores, compensation tiers, performance evaluations, and tenure.",
    csvData: `Employee_ID,Hire_Date,Department,Job_Role,Monthly_Salary,Overtime_Hours,Satisfaction_Score,Performance_Rating,Attrition_Risk
EMP-801,2021-03-15,Engineering,Software Engineer,$8500.00,12,7.8,4,Low
EMP-802,2019-06-20,Sales,Account Executive,$6800.00,28,4.2,3,High
EMP-803,2022-01-10,Marketing,Growth Specialist,$6200.00,15,6.5,3,Medium
EMP-804,2018-09-05,Engineering,Tech Lead,$12400.00,8,8.5,5,Low
EMP-805,2023-04-18,Customer Support,Support Specialist,$4200.00,34,3.8,2,High
EMP-806,2020-11-12,Product,Product Manager,$10500.00,18,7.2,4,Low
EMP-807,2021-08-25,Sales,Sales Manager,$9200.00,22,6.0,4,Medium
EMP-808,2022-05-30,Engineering,Frontend Engineer,$7900.00,10,8.0,4,Low
EMP-809,2019-02-14,Human Resources,HR Business Partner,$7100.00,14,7.5,3,Low
EMP-810,2023-08-01,Customer Support,Support Lead,$5100.00,26,4.9,3,High
EMP-811,2020-04-15,Engineering,DevOps Engineer,$9800.00,16,7.4,4,Low
EMP-812,2021-10-20,Marketing,Content Manager,$5800.00,12,6.8,3,Medium
EMP-813,2018-12-08,Product,Senior PM,$13200.00,14,8.1,5,Low
EMP-814,2022-07-19,Sales,Account Executive,$6900.00,30,4.0,3,High
EMP-815,2019-09-22,Engineering,Senior Engineer,$11000.00,6,8.9,5,Low
EMP-816,2023-02-11,Customer Support,Support Specialist,$4100.00,32,3.5,2,High
EMP-817,2020-07-03,Human Resources,Recruiter,$5600.00,16,6.9,3,Medium
EMP-818,2021-12-14,Engineering,Data Scientist,$9400.00,11,7.9,4,Low
EMP-819,2022-09-28,Sales,Sales Director,$14500.00,20,7.0,4,Low
EMP-820,2019-05-17,Marketing,Design Lead,$7400.00,10,8.2,4,Low
EMP-821,2023-06-05,Product,Associate PM,$7200.00,24,5.8,3,Medium
EMP-822,2020-01-29,Customer Support,Support Specialist,$4300.00,36,3.2,2,High
EMP-823,2021-04-12,Engineering,QA Engineer,$6800.00,14,7.1,3,Low
EMP-824,2018-08-19,Sales,Account Executive,$7100.00,26,4.6,3,High
EMP-825,2022-11-04,Human Resources,People Ops Manager,$8200.00,12,7.7,4,Low
EMP-808,2022-05-30,Engineering,Frontend Engineer,$7900.00,10,8.0,4,Low
EMP-826,2023-09-15,Marketing,PPC Analyst,,18,6.2,3,Medium
EMP-827,2020-03-22,Engineering,Staff Engineer,$13800.00,,8.6,5,Low`,
  },
];
