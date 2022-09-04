#!/usr/bin/env ruby

unless ENV["DETECTIVE_DATA_PATH"]
  puts "Environment variable $DETECTIVE_DATA_PATH is missing."
  puts "You can add it using following command:"
  puts ""
  puts "    $ echo \"export DETECTIVE_DATA_PATH=/path/to/detective/data\" >> ~/.bash_profile"
  puts "    $ source ~/.bash_profile"
  puts ""
  exit(1)
end

path = File.expand_path(File.dirname(__FILE__))
source_path = ENV["DETECTIVE_DATA_PATH"]

dest_path = File.join(path, "static/assets/Data")
loc_path = File.join(dest_path, "LocImages")

def cmd command
  puts " --> #{command}"
  system command
end

def try command
  unless cmd command
    puts "Command #{command} failed, exiting."
    exit(1)
  end
end

try "rm -rf #{dest_path}"
try  "mkdir -p #{dest_path}"
Dir.glob("#{source_path}/**").each do |f|
    cmd "cp -rf #{f} #{dest_path}/"
end
try "rm -rf #{loc_path}"
try "git fetch && git checkout master && git reset origin/master --hard"
try "jake sqdn:upload"
try 'git commit -a -m "Update manifest"'
try "git push origin master"
try "rm -rf #{dest_path}"
try "bash -l -c \"cd deploy && cap beta deploy\""

puts "DONE"
