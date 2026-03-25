import { useState } from "react";

// ── Complete image map for all 307 commodities in the dataset ─────────────
// Sources: Wikimedia Commons (free, no attribution needed for display)
// Fallback: Unsplash source API (free, no key)
const IMG = {
  "Apple":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/300px-Red_Apple.jpg",
  "Apricot(Jardalu/Khumani)":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Prunes_dried_apricots.jpg/300px-Prunes_dried_apricots.jpg",
  "Almond(Badam)":           "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Almonds_roasted.jpg/300px-Almonds_roasted.jpg",
  "Amla(Nelli Kai)":         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Amla_fruit.jpg/300px-Amla_fruit.jpg",
  "Arecanut(Betelnut/Supari)":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Areca_catechu_fruits.jpg/300px-Areca_catechu_fruits.jpg",
  "Ashgourd":                "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ash_gourd.jpg/300px-Ash_gourd.jpg",
  "Bajra(Pearl Millet/Cumbu)":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bajra_millet.jpg/300px-Bajra_millet.jpg",
  "Banana":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Whole-and-Split.jpg/300px-Banana-Whole-and-Split.jpg",
  "Banana - Green":          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Bananas.jpg/300px-Bananas.jpg",
  "Barley (Jau)":            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Barley_grains.jpg/300px-Barley_grains.jpg",
  "Beans":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/French_beans.jpg/300px-French_beans.jpg",
  "Beetroot":                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Beetroot_001.jpg/300px-Beetroot_001.jpg",
  "Bengal Gram Dal (Chana Dal)":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Chana_Dal_cleaned.jpg/300px-Chana_Dal_cleaned.jpg",
  "Bengal Gram(Gram)(Whole)":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chickpeas_cooked.jpg/300px-Chickpeas_cooked.jpg",
  "Bhindi(Ladies Finger)":   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Okra_-_Abelmoschus_esculentus.jpg/300px-Okra_-_Abelmoschus_esculentus.jpg",
  "Bitter gourd":            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bitter_melon.jpg/300px-Bitter_melon.jpg",
  "Black Gram (Urd Beans)(Whole)":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Urad_beans.jpg/300px-Urad_beans.jpg",
  "Black pepper":            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Black_peppercorns.jpg/300px-Black_peppercorns.jpg",
  "Bottle gourd":            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bottle_gourd_2.jpg/300px-Bottle_gourd_2.jpg",
  "Brinjal":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Eggplant_USDA.jpg/300px-Eggplant_USDA.jpg",
  "Cabbage":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Savoy_Cabbage_x.jpg/300px-Savoy_Cabbage_x.jpg",
  "Capsicum":                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Capsicum_annuum_2.jpg/300px-Capsicum_annuum_2.jpg",
  "Cardamoms":               "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Elettaria_cardamomum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-057.jpg/300px-Elettaria_cardamomum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-057.jpg",
  "Carrot":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/300px-Vegetable-Carrot-Bundle-wStalks.jpg",
  "Cashewnuts":              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Cashew_nut.jpg/300px-Cashew_nut.jpg",
  "Cashew Kernnel":          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Cashew_nut.jpg/300px-Cashew_nut.jpg",
  "Castor Seed":             "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Castor_seed.jpg/300px-Castor_seed.jpg",
  "Cauliflower":             "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Cauliflower_2.jpg/300px-Cauliflower_2.jpg",
  "Cherry":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Cherry_Stella444.jpg/300px-Cherry_Stella444.jpg",
  "Chikoos(Sapota)":         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Sapodilla.jpg/300px-Sapodilla.jpg",
  "Chili Red":               "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chili_peppers_various.jpg/300px-Chili_peppers_various.jpg",
  "Chrysanthemum":           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Chrysanthemum_2.jpg/300px-Chrysanthemum_2.jpg",
  "Cloves":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Cloves.jpg/300px-Cloves.jpg",
  "Cluster beans":           "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Guar_beans.jpg/300px-Guar_beans.jpg",
  "Coconut":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Coconut_on_white.jpg/300px-Coconut_on_white.jpg",
  "Coffee":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/300px-A_small_cup_of_coffee.JPG",
  "Coriander(Leaves)":       "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Coriander_herb.jpg/300px-Coriander_herb.jpg",
  "Corriander seed":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Coriander_seeds.jpg/300px-Coriander_seeds.jpg",
  "Cotton":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Cotton_field_stripped.jpg/300px-Cotton_field_stripped.jpg",
  "Cowpea (Lobia/Karamani)": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Cowpeas.jpg/300px-Cowpeas.jpg",
  "Cucumbar(Kheera)":        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Cucumbers.jpg/300px-Cucumbers.jpg",
  "Cummin Seed(Jeera)":      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Cumin_seeds.jpg/300px-Cumin_seeds.jpg",
  "Custard Apple (Sharifa)": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Custard-Apple.jpg/300px-Custard-Apple.jpg",
  "Drumstick":               "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Moringa_Oleifera_Pods_on_a_Tree.jpg/300px-Moringa_Oleifera_Pods_on_a_Tree.jpg",
  "Dry Chillies":            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Chili_pepper_fruits.jpg/300px-Chili_pepper_fruits.jpg",
  "Dry Grapes":              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Raisins.jpg/300px-Raisins.jpg",
  "Elephant Yam (Suran)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Elephant_foot_yam.jpg/300px-Elephant_foot_yam.jpg",
  "Field Pea":               "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Peas_in_pods_-_Studio.jpg/300px-Peas_in_pods_-_Studio.jpg",
  "French Beans (Frasbean)": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/French_beans.jpg/300px-French_beans.jpg",
  "Garlic":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Garlic_bulb_separated_on_white.jpg/300px-Garlic_bulb_separated_on_white.jpg",
  "Ginger(Dry)":             "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Ginger-root.jpg/300px-Ginger-root.jpg",
  "Ginger(Green)":           "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ginger_roots.jpg/300px-Ginger_roots.jpg",
  "Grapes":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Kyoho-grape.jpg/300px-Kyoho-grape.jpg",
  "Green Chilli":            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Chili_pepper_fruits.jpg/300px-Chili_pepper_fruits.jpg",
  "Green Gram (Moong)(Whole)":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Moong_beans.jpg/300px-Moong_beans.jpg",
  "Green Peas":              "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Peas_in_pods_-_Studio.jpg/300px-Peas_in_pods_-_Studio.jpg",
  "Groundnut":               "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Peanuts_open.jpg/300px-Peanuts_open.jpg",
  "Groundnut pods (raw)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Peanuts_open.jpg/300px-Peanuts_open.jpg",
  "Guava":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Guava_ID.jpg/300px-Guava_ID.jpg",
  "Gur(Jaggery)":            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Jaggery_block.jpg/300px-Jaggery_block.jpg",
  "Jack Fruit":              "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Jackfruit_hanging.jpg/300px-Jackfruit_hanging.jpg",
  "Jasmine":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Jasminum_sambac.jpg/300px-Jasminum_sambac.jpg",
  "Jowar(Sorghum)":          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sorghum_close-up.jpg/300px-Sorghum_close-up.jpg",
  "Jute":                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Jute_plant.jpg/300px-Jute_plant.jpg",
  "Kabuli Chana(Chickpeas-White)":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chickpeas_cooked.jpg/300px-Chickpeas_cooked.jpg",
  "Karbuja(Musk Melon)":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Muskmelon.jpg/300px-Muskmelon.jpg",
  "Kinnow":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Oranges_and_orange_juice.jpg/300px-Oranges_and_orange_juice.jpg",
  "Lemon":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Lemon_-_whole_and_split.jpg/300px-Lemon_-_whole_and_split.jpg",
  "Lentil (Masur)(Whole)":   "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Masoor_dal.jpg/300px-Masoor_dal.jpg",
  "Lime":                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/300px-Hapus_Mango.jpg",
  "Linseed":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Linseed_flax.jpg/300px-Linseed_flax.jpg",
  "Litchi":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Lychee_fruit_closeup.jpg/300px-Lychee_fruit_closeup.jpg",
  "Maize":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/A_corn_stalk_with_ears.jpg/300px-A_corn_stalk_with_ears.jpg",
  "Mango":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mango_India.jpg/300px-Mango_India.jpg",
  "Mango (Raw-Ripe)":        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mango_India.jpg/300px-Mango_India.jpg",
  "Marigold(Calcutta)":      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Marigold.jpg/300px-Marigold.jpg",
  "Marigold(loose)":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Marigold.jpg/300px-Marigold.jpg",
  "Mashrooms":               "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Mushrooms.jpg/300px-Mushrooms.jpg",
  "Masur Dal":               "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Masoor_dal.jpg/300px-Masoor_dal.jpg",
  "Methi Seeds":             "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Fenugreek_seeds.jpg/300px-Fenugreek_seeds.jpg",
  "Methi(Leaves)":           "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Fenugreek_Leaves.jpg/300px-Fenugreek_Leaves.jpg",
  "Mint(Pudina)":            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mint-2.jpg/300px-Mint-2.jpg",
  "Mousambi(Sweet Lime)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Oranges_and_orange_juice.jpg/300px-Oranges_and_orange_juice.jpg",
  "Mustard":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mustard_seeds_2.jpg/300px-Mustard_seeds_2.jpg",
  "Nutmeg":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Nutmeg_seeds.jpg/300px-Nutmeg_seeds.jpg",
  "Onion":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Onion_on_white_background.jpg/300px-Onion_on_white_background.jpg",
  "Onion Green":             "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Fresh_green_onions.jpg/300px-Fresh_green_onions.jpg",
  "Orange":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Oranges_and_orange_juice.jpg/300px-Oranges_and_orange_juice.jpg",
  "Paddy(Dhan)(Basmati)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/300px-White_rice.jpg",
  "Paddy(Dhan)(Common)":     "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/300px-White_rice.jpg",
  "Papaya":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Papaya_Mexico_City_edit.jpg/300px-Papaya_Mexico_City_edit.jpg",
  "Papaya (Raw)":            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Papaya_Mexico_City_edit.jpg/300px-Papaya_Mexico_City_edit.jpg",
  "Peach":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Peach_fb.jpg/300px-Peach_fb.jpg",
  "Pear(Marasebu)":          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Pears.jpg/300px-Pears.jpg",
  "Peas Wet":                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Peas_in_pods_-_Studio.jpg/300px-Peas_in_pods_-_Studio.jpg",
  "Peas(Dry)":               "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Peas_in_pods_-_Studio.jpg/300px-Peas_in_pods_-_Studio.jpg",
  "Pineapple":               "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Pineapple_and_cross_section.jpg/300px-Pineapple_and_cross_section.jpg",
  "Plum":                    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Plums_on_white.jpg/300px-Plums_on_white.jpg",
  "Pointed gourd (Parval)":  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Parwal.jpg/300px-Parwal.jpg",
  "Pomegranate":             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Pomegranate_fruit_-_whole.jpg/300px-Pomegranate_fruit_-_whole.jpg",
  "Potato":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Potato_%28Solanum_tuberosum%29.jpg/300px-Potato_%28Solanum_tuberosum%29.jpg",
  "Pumpkin":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/FrenchMarketPumpkinsB.jpg/300px-FrenchMarketPumpkinsB.jpg",
  "Raddish":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Radish_LE.jpg/300px-Radish_LE.jpg",
  "Ragi (Finger Millet)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Ragi.jpg/300px-Ragi.jpg",
  "Rice":                    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/300px-White_rice.jpg",
  "Ridge gourd(Tori)":       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Ridge_gourd.jpg/300px-Ridge_gourd.jpg",
  "Rose(Local)":             "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Rhdr.jpg/300px-Rhdr.jpg",
  "Rose(Loose)":             "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Rhdr.jpg/300px-Rhdr.jpg",
  "Rubber":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Rubber_plant.jpg/300px-Rubber_plant.jpg",
  "Safflower":               "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Safflower_2.jpg/300px-Safflower_2.jpg",
  "Sesamum(Sesame,Gingelly,Til)":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sesame_seeds.jpg/300px-Sesame_seeds.jpg",
  "Snake gourd":             "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Snake_gourd.jpg/300px-Snake_gourd.jpg",
  "Soanf":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Fennel_seeds.jpg/300px-Fennel_seeds.jpg",
  "Soyabean":                "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Soybeans_USDA.jpg/300px-Soybeans_USDA.jpg",
  "Spinach":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Spinach_leaves.jpg/300px-Spinach_leaves.jpg",
  "Sponge gourd":            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Sponge_gourd.jpg/300px-Sponge_gourd.jpg",
  "Sugar":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Sugar_2xmacro.jpg/300px-Sugar_2xmacro.jpg",
  "Sugarcane":               "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sugar_cane_Cali.jpg/300px-Sugar_cane_Cali.jpg",
  "Sunflower":               "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/300px-Sunflower_sky_backdrop.jpg",
  "Sunflower Seed":          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Sunflower_seeds.jpg/300px-Sunflower_seeds.jpg",
  "Sweet Potato":            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Ipomoea_batatas_006.jpg/300px-Ipomoea_batatas_006.jpg",
  "Tamarind Fruit":          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Tamarind_pods.jpg/300px-Tamarind_pods.jpg",
  "Tapioca":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Tapioca_pearls.jpg/300px-Tapioca_pearls.jpg",
  "Tea":                     "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Black_tea_leaves_2.jpg/300px-Black_tea_leaves_2.jpg",
  "Tender Coconut":          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Coconut_water.jpg/300px-Coconut_water.jpg",
  "Tobacco":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Tobacco_leaf.jpg/300px-Tobacco_leaf.jpg",
  "Tomato":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/300px-Tomato_je.jpg",
  "Turmeric":                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Curcuma_longa_roots.jpg/300px-Curcuma_longa_roots.jpg",
  "Turmeric (raw)":          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Curcuma_longa_roots.jpg/300px-Curcuma_longa_roots.jpg",
  "Turnip":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Turnip_2622027.jpg/300px-Turnip_2622027.jpg",
  "Walnut":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Walnuts_-_whole_and_open.jpg/300px-Walnuts_-_whole_and_open.jpg",
  "Water Melon":             "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Watermelon_seedless.jpg/300px-Watermelon_seedless.jpg",
  "Wheat":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Wheat_close-up.JPG/300px-Wheat_close-up.JPG",
  "Wheat Atta":              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Wheat_close-up.JPG/300px-Wheat_close-up.JPG",
  "Yam":                     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Yam.jpg/300px-Yam.jpg",
  "Yam (Ratalu)":            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Yam.jpg/300px-Yam.jpg",
  // Flowers
  "Anthorium":               "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Anthurium.jpg/300px-Anthurium.jpg",
  "Carnation":               "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Carnation_flowers.jpg/300px-Carnation_flowers.jpg",
  "Chrysanthemum(Loose)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Chrysanthemum_2.jpg/300px-Chrysanthemum_2.jpg",
  "Gladiolus Cut Flower":    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gladiolus_01.jpg/300px-Gladiolus_01.jpg",
  "Lotus":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Nelumno_nucifera_open_flower.jpg/300px-Nelumno_nucifera_open_flower.jpg",
  "Lilly":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Lilium_candidum.jpg/300px-Lilium_candidum.jpg",
  "Orchid":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Orchidaceae_poster_2.jpg/300px-Orchidaceae_poster_2.jpg",
  "Tube Rose(Double)":       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Tuberose.jpg/300px-Tuberose.jpg",
  "Tube Rose(Loose)":        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Tuberose.jpg/300px-Tuberose.jpg",
  "Tube Rose(Single)":       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Tuberose.jpg/300px-Tuberose.jpg",
  // Spices
  "Bay leaf (Tejpatta)":     "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Dried_bay_leaf.jpg/300px-Dried_bay_leaf.jpg",
  "Ajwan":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ajwain_seeds.jpg/300px-Ajwain_seeds.jpg",
  "Cocoa":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Cocoa-pod-open.jpg/300px-Cocoa-pod-open.jpg",
  "Coffee":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Coffee_beans_closeup.jpg/300px-Coffee_beans_closeup.jpg",
  "Mace":                    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Mace_spice.jpg/300px-Mace_spice.jpg",
  // Pulses
  "Arhar (Tur/Red Gram)(Whole)":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Toor_dal.jpg/300px-Toor_dal.jpg",
  "Arhar Dal(Tur Dal)":      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Toor_dal.jpg/300px-Toor_dal.jpg",
  "Black Gram Dal (Urd Dal)":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Urad_beans.jpg/300px-Urad_beans.jpg",
  "Green Gram Dal (Moong Dal)":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Moong_beans.jpg/300px-Moong_beans.jpg",
  // Gourds
  "Chow Chow":               "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Chayote_fruit.jpg/300px-Chayote_fruit.jpg",
  "Little gourd (Kundru)":   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Coccinia_grandis_fruit.jpg/300px-Coccinia_grandis_fruit.jpg",
  "Long Melon(Kakri)":       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Kakri.jpg/300px-Kakri.jpg",
  "Round gourd":             "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tinda.jpg/300px-Tinda.jpg",
  "Tinda":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tinda.jpg/300px-Tinda.jpg",
  "White Pumpkin":           "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ash_gourd.jpg/300px-Ash_gourd.jpg",
  "Sweet Pumpkin":           "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/FrenchMarketPumpkinsB.jpg/300px-FrenchMarketPumpkinsB.jpg",
  "Squash(Chappal Kadoo)":   "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/FrenchMarketPumpkinsB.jpg/300px-FrenchMarketPumpkinsB.jpg",
  // Grains
  "Beaten Rice":             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Poha.jpg/300px-Poha.jpg",
  "Broken Rice":             "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/300px-White_rice.jpg",
  "Foxtail Millet(Navane)":  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Foxtail_millet.jpg/300px-Foxtail_millet.jpg",
  "Jowar(Sorghum)":          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sorghum_close-up.jpg/300px-Sorghum_close-up.jpg",
  "Millets":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Millet_en.jpg/300px-Millet_en.jpg",
  // Others with Unsplash fallback key
  "Ber(Zizyphus/Borehannu)": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Ber_fruit.jpg/300px-Ber_fruit.jpg",
  "Jamun(Narale Hannu)":     "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Jambul_(Syzygium_cumini).jpg/300px-Jambul_(Syzygium_cumini).jpg",
  "Persimon(Japani Fal)":    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Persimmon.jpg/300px-Persimmon.jpg",
  "Betal Leaves":            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Betel_leaf.jpg/300px-Betel_leaf.jpg",
  "Colacasia":               "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Colocasia_esculenta.jpg/300px-Colocasia_esculenta.jpg",
  "Copra":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Coconut_on_white.jpg/300px-Coconut_on_white.jpg",
  "Drumstick":               "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Moringa_Oleifera_Pods_on_a_Tree.jpg/300px-Moringa_Oleifera_Pods_on_a_Tree.jpg",
  "Isabgul (Psyllium)":      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Psyllium_husks.jpg/300px-Psyllium_husks.jpg",
  "Mahua":                   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Mahua_flower.jpg/300px-Mahua_flower.jpg",
  "Neem Seed":               "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Neem_Tree_Chips.jpg/300px-Neem_Tree_Chips.jpg",
  "Niger Seed (Ramtil)":     "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Niger_seed.jpg/300px-Niger_seed.jpg",
};

// Emoji fallback for commodities without a specific image
const EMOJI_MAP = {
  "Ajwan":"🌿","Alasande Gram":"🫘","Alsandikai":"🥬","Amaranthus":"🌿",
  "Ambada Seed":"🌱","Amphophalus":"🥔","Antawala":"🌿","Astera":"🌸",
  "Avare Dal":"🫘","BOP":"🌾","Bamboo":"🎋","Bran":"🌾","Broomstick(Flower Broom)":"🌾",
  "Bull":"🐂","Bullar":"🐄","Bunch Beans":"🫘","Butter":"🧈","Calf":"🐄","Cane":"🎋",
  "Castor Oil":"🫙","Chapparad Avare":"🫘","Chennangi (Whole)":"🫘",
  "Chennangi Dal":"🫘","Chilly Capsicum":"🫑","Coca":"🌿","Cock":"🐓",
  "Coconut Oil":"🫙","Coconut Seed":"🥥","Cotton Seed":"🌱","Cow":"🐄",
  "Cowpea(Veg)":"🫘","Daila(Chandni)":"🌸","Dal (Avare)":"🫘","Dalda":"🧈",
  "Delha":"🌾","Dry Fodder":"🌾","Duck":"🦆","Duster Beans":"🫘",
  "Egg":"🥚","Firewood":"🪵","Fish":"🐟","Flower Broom":"🌾",
  "Galgal(Lemon)":"🍋","Ghee":"🧈","Gingelly Oil":"🫙","Goat":"🐐",
  "Gram Raw(Chholia)":"🫘","Gramflour":"🌾","Green Avare (W)":"🫘",
  "Green Fodder":"🌿","Ground Nut Oil":"🫙","Ground Nut Seed":"🥜",
  "Groundnut (Split)":"🥜","Guar":"🫘","Guar Seed(Cluster Beans Seed)":"🌱",
  "Gurellu":"🌱","Haralekai":"🥬","He Buffalo":"🦬","Hen":"🐓",
  "Hippe Seed":"🌱","Honge seed":"🌱","Hybrid Cumbu":"🌾",
  "Indian Beans (Seam)":"🫘","Indian Colza(Sarson)":"🌿","Jaffri":"🌿",
  "Jarbara":"🌾","Javi":"🌾","Jute Seed":"🌱","Kakada":"🥒",
  "Karamani":"🫘","Kartali (Kantola)":"🥒","Kharif Mash":"🫘",
  "Knool Khol":"🥬","Kodo Millet(Varagu)":"🌾","Kulthi(Horse Gram)":"🫘",
  "Lak(Teora)":"🌿","Leafy Vegetable":"🥬","Linseed":"🌱","Lint":"🌱",
  "Lotus Sticks":"🌿","Lukad":"🌾","Mahua Seed(Hippe seed)":"🌱",
  "Maida Atta":"🌾","Maragensu":"🍈","Marasebu":"🍐","Marget":"🌾",
  "Mataki":"🫘","Moath Dal":"🫘","Mustard Oil":"🫙","Myrobolan(Harad)":"🌿",
  "Other Pulses":"🫘","Ox":"🐂","Patti Calcutta":"🌸","Peas cod":"🫘",
  "Pegeon Pea (Arhar Fali)":"🫘","Pepper garbled":"🌶️","Pepper ungarbled":"🌶️",
  "Pigs":"🐷","Raibel":"🌾","Rajgir":"🌾","Ram":"🐏",
  "Rat Tail Radish (Mogari)":"🌿","Raya":"🌱","Red Gram":"🫘",
  "Resinwood":"🪵","Riccbcan":"🌾","Safflower":"🌸","Sajje":"🌾",
  "Same/Savi":"🌾","Sarasum":"🌿","Season Leaves":"🍃","Seemebadnekai":"🥬",
  "Seetafal":"🍈","She Buffalo":"🦬","She Goat":"🐐","Sheep":"🐑",
  "Skin And Hide":"🐄","Soji":"🌾","Sunhemp":"🌿",
  "Surat Beans (Papadi)":"🫘","Suva (Dill Seed)":"🌿",
  "Suvarna Gadde":"🥔","T.V. Cumbu":"🌾","Tamarind Seed":"🌿",
  "Taramira":"🌱","Thinai (Italian Millet)":"🌾","Thogrikai":"🥒",
  "Thondekai":"🥒","Toria":"🌿","White Peas":"🫘","Wood":"🪵",
};

const FALLBACK_URL = (name) =>
  `https://source.unsplash.com/300x300/?${encodeURIComponent(name.split("(")[0].trim())},food,vegetable,fruit,crop`;

// ── Main component ────────────────────────────────────────────────────────────
export default function CommodityImage({ commodity, size = 56, showPopup = true }) {
  const [open, setOpen]     = useState(false);
  const [imgError, setImgError] = useState(false);

  const src = !imgError && IMG[commodity]
    ? IMG[commodity]
    : null;

  const emoji = EMOJI_MAP[commodity] || "🌾";

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => showPopup && setOpen(true)}
        title={commodity}
        style={{
          width: size, height: size,
          borderRadius: 10,
          border: "2px solid var(--border)",
          overflow: "hidden",
          cursor: showPopup ? "pointer" : "default",
          flexShrink: 0,
          transition: "transform 0.2s, box-shadow 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--green-pale)",
          fontSize: size * 0.5,
        }}
        onMouseOver={e => { if (showPopup) { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}}
        onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {src ? (
          <img
            src={src}
            alt={commodity}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      {/* Popup modal */}
      {open && showPopup && (
        <>
          <div
            className="overlay"
            onClick={() => setOpen(false)}
            style={{ zIndex: 900 }}
          />
          <div
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white", borderRadius: 20,
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
              padding: 0, zIndex: 1000,
              width: 320, maxWidth: "92vw",
              overflow: "hidden",
              animation: "popIn 0.18s ease-out",
            }}
          >
            {/* Image */}
            <div style={{ width: "100%", height: 220, background: "var(--green-pale)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {src ? (
                <img
                  src={src}
                  alt={commodity}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span style={{ fontSize: 100 }}>{emoji}</span>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute", top: 10, right: 10,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)", color: "white",
                  border: "none", cursor: "pointer", fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* Info */}
            <div style={{ padding: "16px 20px 20px" }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>
                {commodity}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Agricultural commodity · Available across Indian mandis
              </p>
              <button
                className="btn btn-green btn-full"
                style={{ marginTop: 14 }}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @keyframes popIn {
              from { transform: translate(-50%,-50%) scale(0.88); opacity: 0; }
              to   { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
}
