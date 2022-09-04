module Dump
  class GroupMapFormatter < Formatter

    def initialize(islands)
      @islands = islands
    end

    def for_view(context)
      group_by_island(context.current_dump)
    end

    def for_save(context)
      result_items = context.current_dump['map']['items'].deep_dup
      result_items.each_pair do |id, item|
        new_item = find_map_item(context.edited_dump, id)
        if new_item.nil?
          #delete item
          context.current_dump['map']['items'].delete(id)
        else
          #change item
          context.current_dump['map']['items'][id] = new_item
        end
      end

      #add new items
      new_items = {}
      each_by_island(context.edited_dump){|id, item| new_items[id] = item}
      new_items.each_pair do |id, item|
        unless context.current_dump['map']['items'].has_key?(id)
          context.current_dump['map']['items'][id] = item
        end
      end
      context.current_dump
    end

    private
    def find_map_item(edited_dump, id)
      edited_dump.each_pair do |island_name, island|
        island.each_pair do |type, type_items|
          return type_items[id] if type_items.has_key?(id)
        end
      end
      nil
    end

    def group_by_island(current_dump)
      user_islands = Hash.new{|h, k| h[k] = {}}
      @islands.map do |key, island|
        next unless exist_island?(current_dump, key)
        user_islands[key] = find_island_items(current_dump, island)
      end

      incorrect_items = incorrect_items(current_dump, user_islands)
      user_islands['without_island'] = incorrect_items if incorrect_items.keys.size > 0
      user_islands
    end

    #get objects which not belong to any of the islands
    def incorrect_items(current_dump, islands)
      correct_items = {}
      each_by_island(islands){|id, item| correct_items[id] = item}
      incorrect_items = {}
      current_dump['map']['items'].each_pair do |id, item|
        incorrect_items[id] = item unless correct_items.has_key?(id)
      end
      group_by_type_id(incorrect_items)
    end

    def each_by_island(islands, &block)
      islands.each_pair do |type, type_items|
        type_items.each_pair do |type_id, items|
          items.each_pair{|id, item| yield(id, item)}
        end
      end
    end

    def exist_island?(dump, island_id)
      dump['map']['islands'].find{|key, item| item['type_id'] == island_id}
    end

    def find_island_items(dump, island)
      squares = island['squares']
      items = {}
      groups = Hash.new{ |h, k| h[k] = {} }

      squares.each do |square, value|
        next if dump['map']['squares'][square].nil?
        items_ids = dump['map']['squares'][square].keys
        current_items = dump['map']['items'].select{|id, item| items_ids.include?(id)}
        items.merge!(current_items)
      end
      group_by_type_id(items)
    end

    def group_by_type_id(items)
      groups = Hash.new{ |h, k| h[k] = {} }
      items.each do |key, item|
        next if item.nil?
        groups[item['type_id']][key] = item
      end
      groups.keys.each do |old_key|
        new_key = "#{old_key}(#{groups[old_key].keys.join(',')})"
        groups = groups.rewrite_key(old_key.to_s => new_key)
      end
      groups
    end

  end
end