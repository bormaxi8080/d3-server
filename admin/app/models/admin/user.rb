module Admin

  class User
    ROLES = %w(designer support tester) #Roles from squath

    attr_accessor :id, :email

    def self.from_squard_user(user)
      new(user)
    end

    def initialize(user)
      @user = user
      @email = user.email
      @id = Digest::MD5.hexdigest(@email)
    end

    def method_missing(method, *args, &block)
      @user.send(method, *args, &block) if (@user.respond_to?(method))
    end

    def name_from_email
      @email.split("@", 2).first
    end

    #%w(admin support tester).each do |role|
    #  define_method("is_#{role}?") {@user.has_roles?([role])}
    #end

    ROLES.each do |role|
      define_method("is_#{role}?") { true }
    end

  end
end
