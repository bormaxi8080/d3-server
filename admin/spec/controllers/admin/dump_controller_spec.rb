require 'spec_helper'

describe Admin::DumpController do

  it_should_behave_like 'success response', :clone, :get

  describe '#apply' do
    it 'when post without params' do
      post :apply
      GameServer.instance.stub(:backup_user){'ok'}
      expect(response).to be_success
      expect(response.status).to eq(200)
      expect(JSON.parse(response.body)['status']).to eq('error')
    end

    it 'when bad reponse on use_get_dump' do
      GameServer.instance.stub(:get_user_dump){ JSON.parse('[{"player": 1, "map": {"options": {"location": {"current_room": 1}}}}]')}
      GameServer.instance.stub(:get_user){ {social_id: 1} }
      GameServer.instance.stub(:save_user_dump){ 'OK' }
      GameServer.instance.stub(:backup_user){'ok'}
      post :apply, from_user_id: 1, to_user_id: 2
      expect(JSON.parse(response.body)['status']).to eq('error')
      expect(response.status).to eq(200)
    end
  end

  describe '#edit' do
    before(:each) {
      @user = Fabricate(:user)
      @user.stub(:has_roles?) {true}
      @user.stub(:has_any_role?) {true}
    }

    it "when true role" do
      @user.stub(:is_admin?) {true}
      Admin::ApplicationController.any_instance.stub(:current_user) {@user}
      json = '[{"player": {"social_id": 1, "from_social_id": 10}, "map": {"options": {"location": {"current_room": 1}}}}]'
      GameServer.instance.stub(:get_user_dump){Yajl::Parser.parse(json)}
      GameServer.instance.stub(:get_defs){{}}
      GameServer.instance.stub(:get_backup_list){'ok'}
      get :edit
      expect(response).to be_success
      expect(response.status).to eq(200)
    end

    it "when false role" do
      @user.stub(:is_admin?) {true}
      Admin::ApplicationController.any_instance.stub(:current_user) {@user}
      json = Yajl::Parser.parse('[{"player": {"social_id": 1, "from_social_id": 10}, "map": {"options": {"location": {"current_room": 1}}}}]')
      GameServer.instance.stub(:get_user_dump){json}
      GameServer.instance.stub(:get_defs){{}}
      GameServer.instance.stub(:get_backup_list){[]}
      get :edit
      expect(response).to be_success
      expect(response.status).to eq(200)
      expect(response).to render_template('edit')
    end
  end

  def gzip(string)
    wio = StringIO.new("w")
    w_gz = Zlib::GzipWriter.new(wio)
    w_gz.write(string)
    w_gz.close
    wio.string
  end

end
