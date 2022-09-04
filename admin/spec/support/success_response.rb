shared_examples 'success response' do |action, method, params|
  describe "##{action} action", :if => described_class.instance_methods.include?(action) do
    it "with #{method.upcase} method" do
      send(method, action, params)
      expect(response).to be_success
      expect(response.status).to eq(200)
      expect(response).to render_template(action)
    end
  end
end