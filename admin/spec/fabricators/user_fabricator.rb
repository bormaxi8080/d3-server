Fabricator(:user, from: Admin::User) do
  email 'fabric_user@example.com'
  User = Struct.new(:email)
  on_init{ init_with(User.new('fabric_user@example.com'))}
end