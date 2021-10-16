(function($){
	$.fn.list = function(options){
		
		var sorted = [];
		var compare;
		
		options = $.extend({
			items: [],
			compareBy: 2			//	Сравнивать по вторым словам
		}, options);		

        $.fn.list.InsertItem = function(item) {
			sorted.push(item);
			sorted.sort(compare);
            return true;
        };
		
        $.fn.list.BuildList = function() {

		
            return true;
        };		
        
        $.fn.list.settings = options;
				
		function compare1(a, b) {
			var splitA = a.split(" ");
			var splitB = b.split(" ");
			var firstA = splitA[splitA.length - 2];
			var firstB = splitB[splitB.length - 2];

			if (firstA < firstB) return -1;
			if (firstA > firstB) return 1;
			return 0;
		}
		
		function compare2(a, b) {
			var splitA = a.split(" ");
			var splitB = b.split(" ");
			var lastA = splitA[splitA.length - 1];
			var lastB = splitB[splitB.length - 1];

			if (lastA < lastB) return -1;
			if (lastA > lastB) return 1;
			return 0;
		}		
		
		//	Улучшить compare для сравнения имён
		//	Разобрать вариант, если нет А
		
		
		var build = function(){

			var srcItems = [];
		
			//	Проверяем был ли список передан параметром
			if (typeof options.items !== 'undefined' && options.items.length > 0) {
				srcItems = options.items;
			}
			
			//	Проверяем был ли список задан html-разметкой
			if ($('ul li', this).length > 0) {
				$('ul li', this).each(function(){
					srcItems.push( $(this).text() );
				});
				
				//	Удаляем исходную разметку
				$('ul', this).remove();
			}
			
			//	Выбираем функцию для сортировки
			switch (options.compareBy) {
				case 1: compare = compare1; break;
				case 2: compare = compare2; break;
			}
			
			//	Сортируем
			sorted = srcItems.sort(compare)
			
			//	Генериуем разметку внутри контейнера .list
			
			$( this ).append( "<div class='list-subheader current'>А</div>" )			//	Плавающий контейнер
				.append('<div class="list-wrapper"></div>');							//	Обёртка внутренних секций
			
			var wrapper = $( '.list-wrapper', this ),
				prevLetter = '',
				curSection;
			
			//	перебираем элементы отсортированного списка
			$.each( sorted, function( i, v ){
				
				var compared;
				var full = v;

				//	Выясняем по какому слову сравнивать будем
				switch (options.compareBy) {
					case 1: compared = full.split(' ').slice(0, -1).join(' '); break;		//	first
					case 2: compared = full.split(' ').slice(-1).join(' '); break;			//	last
				}
				
				$.fn.list.items = sorted;
				
				//	Для очередного элемента списка получаем первый символ
				var curLetter = compared.charAt(0);
				
				//	Если символ новый
				if (curLetter != prevLetter) {
					//	то создаём новую секцию
					wrapper.append('<div class="list-subwrapper"></div>');
					curSection = $( '.list-subwrapper:last-child', wrapper);
					curSection.append('<div class="list-subheader">' + curLetter + '</div>	');
					curSection.append('<ul class="list-items"></ul>');
					prevLetter = curLetter;
				}
				
				//	Выводим очередной элемент
				$( '.list-items', curSection ).append('<li>' + v + '</li>');
			});
				
		
		
		
			//	Вычисляем ширину подзаголовков и устанавливаем её для плавающего контейнера
			var headerWidth = $($( ".list-subwrapper", this )[0]).width();			
			$('.current', this).css({ width: headerWidth});
		
		
		
			//	Делаем сравниваемое слово жирным
			$( ".list-items li", this ).each(function( index ) {
				var full = $( this ).text();
				var first = full.split(' ').slice(0, -1).join(' ');
				var last = full.split(' ').slice(-1).join(' ');
				$( this ).html(first + " <b>" + last + "</b>");
				
				//	Выясняем по какому слову сравниваем
				switch (options.compareBy) {
					case 1: $( this ).html("<b>" + first + "</b> " + last); break;			//	first
					case 2: $( this ).html(first + " <b>" + last + "</b>"); break;			//	last
				}					
			});

			
			$( '.list-wrapper', this ).scroll(function() {
				
				var topOffset = 0,
					list_ = $(this),
					current = $('.current', $(list_).parent());		//	плавающий контейнер
				
				//	Получаем все секции: подзаголовок + список
				$( ".list-subwrapper", this ).each(function( index ) {

					var p = $( this );
					var position = p.position();

					//	Если секция наверху списка, то она будет текущей (активной)
					if (position.top <= 0 && position.top + p.height() > 0) {

						//	Это заголовок текущей секции и его высота
						var subhead = $( this ).find( ".list-subheader" );
						var height_ = subhead.height();

						//	Задаём текст для плавающего контейнера
						current.html(subhead.text());
						
						//	Задаём оффсет для плавающего контейнера - если он соприкасается с каким-то из подзаголовков, то его надо подвинуть
						if (position.top + p.height() - height_ < 0) {
							topOffset = height_ - (position.top + p.height());
						}
						
					}
					
				});
				
				//	Задаём top для плавающего контейнера, если есть какой-то ненулевой topOffset (соприкасается с каким-то из подзаголовков)
				//	Иначе важно сделать 0, чтобы контейнер вставал на место при "отклеивании"
				current.css({ top: -topOffset });				
				
			});			
		};
	 
		return this.each(build); 
	};
})(jQuery);





