module Admin
  module ApplicationHelper

    def nav_link(title, path, method = nil)
      class_name = current_page?(path) ? 'active' : ''

      content_tag(:li, :class => class_name) do
        link_to title, path, method: method
      end
    end

    def nav_link_dropdown(title, links)
      class_name = ''
      puts links.find{|link| current_page?(link['path'])}
      if links.find{|link| current_page?(link[:path])}
        class_name = 'active'
      end

      content_tag(:li, class: "dropdown #{class_name}") do
        content_tag(:a, class: 'dropdown-toggle', "data-toggle" => "dropdown", :href => "#") do
          (title + content_tag(:b, '', class: 'caret')).html_safe
        end <<
        content_tag(:ul, class: 'dropdown-menu') do
          links.collect do |link|
            concat(nav_link(link[:title], link[:path], link[:method]))
          end
        end
      end
    end

  end
end