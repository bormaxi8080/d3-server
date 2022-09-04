require 'spec_helper'

describe Dump::GroupMapFormatter do
  before(:each) do
    @islands = {"default_island"=>{"name"=>"default_island_name", "description"=>"default_island_desc", "category"=>"islands", "weight"=>30, "icon_id"=>"", "buyable"=>false, "sellable"=>false, "squares"=>{"-1x-2"=>true, "-1x-1"=>true, "-1x0"=>true, "0x-2"=>true, "0x-1"=>true, "0x0"=>true, "1x-1"=>true}}, "island_2"=>{"name"=>"island_2_name", "description"=>"island_2_desc", "category"=>"islands", "icon_id"=>"icon_island_2", "buyable"=>true, "sellable"=>false, "squares"=>{"1x0"=>true, "1x1"=>true, "2x0"=>true, "2x1"=>true, "2x2"=>true, "3x0"=>true, "3x1"=>true, "4x0"=>true}}}
    @formatter = Dump::GroupMapFormatter.new(@islands)
    @current_dump = Fabricate.attributes_for(:user_dump)
    @context = Dump::Container.new(@formatter, @current_dump, @current_dump)
  end

  it "#for_view" do
    dump = @formatter.for_view(@context)
    expect(dump.keys).to eq(@islands.keys << 'without_island') #equal islands
  end

  it "#for_save when dump has not changes" do
    dump = @formatter.for_view(@context)
    context = Dump::Container.new(@formatter, @current_dump, dump)
    saved_dump = @formatter.for_save(context)
    expect(saved_dump).to eq(@current_dump)
  end

  it "#for_save when dump has changes" do
    dump = @formatter.for_view(@context)
    remove_items = [1, 1402].map(&:to_s)

    #remove items from edited_dump
    dump.each_pair do |island_id, island_types|
      island_types.each_pair do |id, items|
        items.each_pair do |id, item|
          items.delete(id) if remove_items.include?(id)
        end
      end
    end

    #add new item
    dump['without_island']['new_test_type'] = {"1111111" => {}}

    context = Dump::Container.new(@formatter, @current_dump, dump)
    @current_dump['map']['items'].delete_if{|id, item| remove_items.include?(id)}
    @current_dump['map']['items']["1111111"] = {}
    saved_dump = @formatter.for_save(context)
    expect(saved_dump).to eq(@current_dump)
  end

end