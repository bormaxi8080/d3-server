class FakeUserDump
  attr_accessor :player, :map

  # def [](key, value)
  #   self.send(key)
  # end
end
Fabricator(:user_dump, from: FakeUserDump) do
  player {
    {
      "social_id"=>"75e110ea9307b4c36e23ead0b12964de",
      "level"=>20,
      "exp"=>9233110,
      "game_balance"=>1673534,
      "real_balance"=>3,
      "food"=>44729
    }
  }
  map {
    {"items" =>
      {
      "1"=>{"coords"=>{"x"=>17, "y"=>-8}, "type_id"=>"advanced_nursery", "time"=>1340186726000, "item_id"=>1, "dragons_id"=>[1425], "built"=>true, "state"=>{"state_id"=>2, "state_start_date"=>1375938381000, "state_expires_date"=>0}, "rotation"=>1, "upgrade"=>{"upgrade_start_date"=>0, "upgrade_expires_date"=>0}},
      "362"=>{"coords"=>{"x"=>18, "y"=>-27}, "built"=>true, "rotation"=>1, "type_id"=>"huge_fire_habitat", "dragons_id"=>[1403, 1296, 1436], "rate"=>106, "temp_cash"=>272, "time"=>1340186726000, "item_id"=>362, "state"=>{"state_id"=>2, "state_start_date"=>1386939813000, "state_expires_date"=>1386940505000}, "cash_changed_time"=>1386939979000, "upgrade"=>{"upgrade_start_date"=>0, "upgrade_expires_date"=>0}},
      "1402"=>{"type_id"=>"decor_road_2", "coords"=>{"x"=>106, "y"=>27}, "rotation"=>0, "item_id"=>1402, "state"=>{"state_id"=>2, "state_start_date"=>1386688340000, "state_expires_date"=>0}, "built"=>true}, "1414"=>{"type_id"=>"decor_arch_2", "coords"=>{"x"=>-5, "y"=>-15}, "rotation"=>0, "item_id"=>1414, "state"=>{"state_id"=>2, "state_start_date"=>1386818309000, "state_expires_date"=>0}, "built"=>true},
      "1426"=>{"type_id"=>"decor_flowerbeg_1", "coords"=>{"x"=>9, "y"=>-14}, "rotation"=>0, "item_id"=>1426, "state"=>{"state_id"=>2, "state_start_date"=>1386911123000, "state_expires_date"=>0}, "built"=>true}, "1427"=>{"type_id"=>"decor_flowerbeg_1", "coords"=>{"x"=>0, "y"=>-24}, "rotation"=>0, "item_id"=>1427, "state"=>{"state_id"=>2, "state_start_date"=>1386911138000, "state_expires_date"=>0}, "built"=>true}},
    "dragons"=>{"2"=>{"type_id"=>"fire_dragon", "click_count"=>0, "current_rate"=>86, "feed_counter"=>36, "perks"=>["level_up", "rate_bonus", "breed_time"], "item_id"=>2, "location_id"=>181, "name"=>"0KHQtdCw0YA=", "state"=>{"state_id"=>2, "state_start_date"=>1360336658840, "state_expires_date"=>0}, "time"=>1360336658840,
    "amplifier"=>{"amplifier_up"=>10, "amplifier_down"=>0}, "current_feed_cost"=>0, "is_in_team"=>false, "can_fight"=>true, "skill_slots"=>[{"state"=>1, "skill_id"=>41}, {"state"=>1, "skill_id"=>1}, {"state"=>0, "skill_id"=>-1}, {"state"=>0, "skill_id"=>-1}]}, "192"=>{"type_id"=>"nature_dragon", "state"=>{"state_id"=>2, "state_start_date"=>1372413651068, "state_expires_date"=>0}, "location_id"=>362, "time"=>1372402466187, "item_id"=>192, "feed_counter"=>36, "current_rate"=>61, "click_count"=>0, "name"=>"0JvQsNCy0LDQvdC90LA=", "amplifier"=>{"amplifier_up"=>10, "amplifier_down"=>0}, "current_feed_cost"=>0, "perks"=>["feed_cost", "feed_cost", "breed_time"], "is_in_team"=>false, "can_fight"=>true, "skill_slots"=>[{"state"=>1, "skill_id"=>41}, {"state"=>1, "skill_id"=>6}, {"state"=>0, "skill_id"=>-1}, {"state"=>0, "skill_id"=>-1}]}},
    "islands"=>{"12"=>{"type_id"=>"default_island", "time"=>1340186726656, "habitat_ids"=>[54, 181, 205, 336, 362, 496, "623"], "amplifier_ids"=>[679, 664], "item_id"=>12, "state"=>{"state_id"=>2, "state_start_date"=>1340186726656, "state_expires_date"=>0}, "amplifiers"=>{"1"=>{"value_up"=>10, "value_down"=>0}, "2"=>{"value_up"=>10, "value_down"=>0}, "8"=>{"value_up"=>0, "value_down"=>-10}, "32"=>{"value_up"=>0, "value_down"=>-10}}}, "503"=>{"type_id"=>"island_2", "time"=>1373453869693, "item_id"=>503, "state"=>{"state_id"=>2, "state_start_date"=>1373503259014, "state_expires_date"=>0}, "habitat_ids"=>[598, 607, "402", 486, "468", "442", "374"], "amplifier_ids"=>[665, 918, 939],
    "amplifiers"=>{"1"=>{"value_up"=>0, "value_down"=>-10}, "4"=>{"value_up"=>10, "value_down"=>-10}, "8"=>{"value_up"=>10, "value_down"=>0}, "16"=>{"value_up"=>10, "value_down"=>-10}, "64"=>{"value_up"=>0, "value_down"=>0}, "128"=>{"value_up"=>0, "value_down"=>0}}}, "789"=>{"type_id"=>"island_3", "time"=>1375384988756, "item_id"=>789, "state"=>{"state_id"=>2, "state_start_date"=>1375473477670, "state_expires_date"=>0}, "habitat_ids"=>[696, 748], "amplifier_ids"=>[930, 953, 1284], "amplifiers"=>{"2"=>{"value_up"=>0, "value_down"=>-10}, "32"=>{"value_up"=>10, "value_down"=>0}, "64"=>{"value_up"=>10, "value_down"=>-10}, "128"=>{"value_up"=>10, "value_down"=>-10}}}},
    "squares"=>{"0x0"=>{"1"=>7, "362"=>7}, "0x-1"=>{"1"=>7, "1402"=>7}, "1x-3"=>{"1402"=>7, "1414"=>7, "1426"=>7, "1427"=>7}}}
  }
end