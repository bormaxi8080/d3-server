class Hash
  def deep_merge(other_hash, &block)
    dup.deep_merge!(other_hash, &block)
  end

  def deep_merge!(other_hash, &block)
    other_hash.each_pair do |k,v|
      tv = self[k]
      if tv.is_a?(Hash) && v.is_a?(Hash)
        self[k] = tv.deep_merge(v, &block)
      else
        self[k] = block && tv ? block.call(k, tv, v) : v
      end
    end
    self
  end

  def rewrite_key mapping
    inject({}) do |rewritten_hash, (original_key, value)|
      rewritten_hash[mapping.fetch(original_key, original_key)] = value
      rewritten_hash
    end
  end


  def intersection(another_hash)
    keys_intersection = self.keys & another_hash.keys
    merged = self.dup.update(another_hash)

    intersection = {}
    keys_intersection.each do |k|
      if merged[k].kind_of? Hash
        intersection[k] = self[k].intersection(merged[k])
      else
        intersection[k] = merged[k]
      end
    end
    intersection
  end

end