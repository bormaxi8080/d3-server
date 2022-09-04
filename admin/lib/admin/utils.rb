module Admin
  class Utils
    BUILD_DEF_NAME = "defs.swf"

    def self.flatten_state(hash, res = {}, name = nil)
      result ||= res
      hash.each do |key, value|
        property = (name.nil?) ? key : "#{name}.#{key}"
        if value.class == Hash
          flatten_state(value, result, property) if value.class == Hash
        else
          result[property] = value
        end
      end
      property = nil
      result
    end

    def self.build_swf_defs(user_app_path)
      shared_def = "#{user_app_path}/src/enchanted/shared/SharedDefinitions.as"
      build_def_path = "#{user_app_path}/"  #{BUILD_DEF_NAME}"
      source_path = "#{user_app_path}/src"

      self.copy_defs_source(user_app_path, source_path)
      cmd = "rake build_def SHARED_DEF=#{shared_def} OUTPUT=#{build_def_path} SOURCE_PATH=#{source_path}"
      %x[#{cmd}]
    end

    def self.copy_defs_source(user_app_path, source_path)
      copy = File.expand_path(user_app_path + "../../src")
      FileUtils.cp_r(copy, user_app_path)

      File.open("#{source_path}/enchanted/shared/createDefinitions.as", "w") do |file|
        file.write(self.user_shared_source_code(user_app_path))
      end
    end

    def self.user_shared_source_code(user_app_path)
      "package enchanted.shared
       {

        include \"#{user_app_path}/createDefinitions.js\";
        }
      ".chomp
    end


    def self.json_manifest_url
      main_manifest = JSON.parse(File.open(File.join(Admin::Config.instance.application[:server][:static_dir], 'bin', 'main.json')).read)
      cdn_url = Admin::Config.instance.application[:settings][:cdn_url]
      "#{cdn_url}/bin/files_combined.#{main_manifest['files_combined.json']}.json"
    end

    class JsBuild
      class << self

        def create_locale(locale_file_path, output_file_path)
          FileUtils.rm(output_file_path) if File.exists?(output_file_path)
          js = self.js_begin("getData")

          body = ""
          File.open(locale_file_path) do |f|
            body = f.read[1..-2]
          end
          js += body
          js += self.js_end

          File.open(output_file_path, "w") do |f|
            f.write(js)
          end
        end

        def create_definitions(path, files, path_to_defs=nil)
          files.delete("/createDefinitions.js")
          f_path = "#{path}/createDefinitions.js"
          create_definition_path = path_to_defs || f_path
          FileUtils.rm(create_definition_path) if File.exist?(create_definition_path)
          js = self.js_begin("createDefinitions")
          js += self.collect_js(path).chomp.chomp(',')
          js += self.js_end
          File.open(create_definition_path, "w") do |f|
            f.write(js)
          end
          f_path
        end

        def collect_js(path)
          s = ""
          Dir.foreach(path) do |entry|
            next if (entry == '..' || entry == '.' || entry == '.git' || entry == 'src' || entry == 'localization')
            full_path = File.join(path, entry)
            if File.directory?(full_path)
              s += "#{entry}: {\n"
              s += collect_js(full_path)
              s += "},\n"
            else
              next unless /\.js(on)?$/.match(entry)
              File.open(full_path) do |f|
                property_name = File.basename(f).split('.').first
                body = f.read
                body = "{}" if body.empty?
                object = "\n\t\t#{property_name.strip}:#{body.strip},"
                s += object
              end
            end
          end
          s.chomp(',')
        end

        def js_begin(js_func_name)
          "
          function #{js_func_name}() {

            return {
          ".strip
        end

        def js_end
          "} // END return
            };
          ".strip
        end
      end
    end
  end
end
