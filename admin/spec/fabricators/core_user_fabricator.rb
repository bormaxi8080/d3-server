class FakeCoreUser
  attr_accessor :social_id, :client_type, :version
  def [](key)
    self.send(key)
  end
end
Fabricator(:core_user, from: FakeCoreUser) do
  social_id 1
  client_type 'ios'
  version '1.42'
end