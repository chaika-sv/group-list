
(function($){
	$.fn.list = function(options){
		
		var sorted = [],
			compare,
			container,
			listID,
			filter = '';
		
		//	Контролы
		var	sortingSelect,
			filterText,
			newItemInput,
			newItemBtn;
		
		options = $.extend({
			items: [],
			compareBy: 2,			//	Сравнивать по вторым словам
			withControls: 0			//	С элементами управления
		}, options);		

        $.fn.list.AddNewItem = function(v) {
			_addNewItem(v);
            return true;
        };
		
        $.fn.list.RemoveItem = function(v) {
			_removeItem(v);
            return true;
        };		
		
        $.fn.list.Filter = function(v) {
			filter = v;
			BuildList(1);
            return true;
        };			
		
        $.fn.list.ChangeSorting = function(v) {
			_changeSorting(v);
            return true;
        };				
		
		function BuildList(rebuild) {

			if (rebuild == 0) {
				container.empty();
				container.append( "<div class='list-subheader current'></div>" )			//	Плавающий контейнер
					.append('<div class="list-wrapper"></div>');							//	Обёртка внутренних секций				
			} else {
				$( '.list-wrapper', container ).empty();
			}
		
			var current = $( '.current', container );
		
			var wrapper = $( '.list-wrapper', container ),
				prevLetter = '',
				curSection;

			if (typeof sorted !== 'undefined' && sorted.length > 0) {
				
				//	перебираем элементы отсортированного списка и выводим их
				$.each( sorted, function( i, v ){
					
					var compared;
					var full = v;
					
					//	Фильтруем
					if ((filter == '') || (v.toUpperCase().indexOf(filter.toUpperCase()) >= 0)) {

						//	Выясняем по какому слову сравнивать будем
						switch (options.compareBy) {
							case 1: compared = full.split(' ').slice(0, -1).join(' '); break;		//	first
							case 2: compared = full.split(' ').slice(-1).join(' '); break;			//	last
						}
						
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
						$( '.list-items', curSection ).append('<li item-name="' + v + '">' + v + '</li>');
						
					}
					
				});

				if ( $( ".list-items li", container ).length == 0 ) {
					current.hide();
					wrapper.append( "Ничего не найдено" );					
				}

				
				//	Ищем верхнюю секцию, чтобы задать букву для плавающего элемента
				$( ".list-subwrapper", wrapper ).each(function( index ) {

					var p = $( this );
					var position = p.position();
					
					//	Если секция наверху списка, то она будет текущей (активной)
					if (position.top <= 0 && position.top + p.height() > 0) {
						//	Это заголовок текущей секции
						var subhead = $( this ).find( ".list-subheader" );
						current.html(subhead.text());
					}
					
				});				
			
			
				//	Вычисляем ширину подзаголовков и устанавливаем её для плавающего контейнера
				var headerWidth = $($( ".list-subwrapper", container )[0]).width();			
				current.css({ width: headerWidth});
			
			
			
				//	Делаем сравниваемое слово жирным
				$( ".list-items li", container ).each(function( index ) {
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
				
				
				if (rebuild == 0) {
					
					//	Обработчик скролла
					wrapper.scroll(function() {
						
						var topOffset = 0;
						
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


					$( '.current', container ).click(function() {
						
						var nextUL = $(this).next();
						var topSection;
						
						//	Ищем верхнюю секцию, чтобы задать букву для плавающего элемента
						$( ".list-subwrapper", wrapper ).each(function( index ) {
							var p = $( this );
							var position = p.position();
							//	Если секция наверху списка, то она будет текущей (активной)
							if (position.top <= 0 && position.top + p.height() > 0) {
								topSection = $( this );
							}
						});	
						
						nextUL = topSection.find('ul');
						if (nextUL.is(":visible")) {
							wrapper.animate({scrollTop: '+=' + topSection.position().top + 'px'}, 400);
							topSection.find('ul').hide("slow");
						} else {
							nextUL.show("slow");
						}						
					});					
				}



				//	Добавляем элементы управления
				if (options.withControls == 1) {
					
					//	Каждому элементу списка добавляем крестик для его удаления
					$( ".list-items li", container ).each(function( index ) {
						$( this ).append("<a class='remove' href='#'>X</a>");
					});
					
					//	Обработчик "крестика" для удаления элемента
					$( '.remove', container ).click(function() {
						
						//	Ищем элемент в sorted
						var v = $(this).parent().attr('item-name');
						_removeItem(v);				
						return false;
						
					});					
				}
				
				
				$( '.list-subheader', container ).click(function() {
					if (!$(this).hasClass("current")) {
						var nextUL = $(this).next();
						if (nextUL.is(":visible")) {
							nextUL.hide("slow");
						} else {
							nextUL.show("slow");
						}
					} 
				});

			}			
			else {
				current.hide();
				wrapper.append( "Лист пуст" );
			}
			
            return true;
        };		        
		
		
		
		
		function compare1(a, b) {
			var splitA = a.split(" ");
			var splitB = b.split(" ");
			var firstA = splitA[splitA.length - 2];
			var firstB = splitB[splitB.length - 2];
			var lastA = splitA[splitA.length - 1];
			var lastB = splitB[splitB.length - 1];
			
			if (firstA + lastA < firstB + lastB) return -1;
			if (firstA + lastA > firstB + lastB) return 1;
			return 0;
		}
		
		function compare2(a, b) {
			var splitA = a.split(" ");
			var splitB = b.split(" ");
			var firstA = splitA[splitA.length - 2];
			var firstB = splitB[splitB.length - 2];
			var lastA = splitA[splitA.length - 1];
			var lastB = splitB[splitB.length - 1];

			if (lastA + firstA < lastB + firstB) return -1;
			if (lastA + firstA > lastB + firstB) return 1;
			return 0;
		}	

		function _addNewItem(v) {
			if (v == '') {
				alert('Введите имя');
			} else {
				//	Добавляем, сортируем, перерисовываем
				sorted.push(v);
				sorted.sort(compare);
				BuildList(1);				
			}	
			return 0;
		}
		
		function _removeItem(v) {
			var i = sorted.indexOf(v);
			
			//	Удаляем и перестраиваем список
			if (i > -1) {
				sorted.splice(i, 1);
				BuildList(1);
			}
			else {
				alert('Элемент не найден в списке');
			}
			return 0;
		}		
		
		function _changeSorting(v) {
			
			if (options.compareBy != v) {
			
				switch (v) {
					case 1: compare = compare1; break;
					case 2: compare = compare2; break;
				}			
			
				options.compareBy = v;
				sorted = sorted.sort(compare);
				sortingSelect.val(v);
		
				BuildList(1);
			}
			
			return 0;
		}	

					
		
		var setup = function(){

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
			sorted = srcItems.sort(compare);
			$.fn.list.items = sorted;
			$.fn.list.settings = options;		
			container = $(this);
			listID = $(container).attr('id');
			
			if (options.withControls == 1) {
				
				//	Получаем контролы
				sortingSelect 	= $( '.sorting[list=' + listID + '] .sortingSelect' );
				filterText 		= $( '.filter[list=' + listID + '] .filterText' );
				newItemInput 	= $( '.newItem[list=' + listID + '] .newItemInput' );
				newItemBtn 		= $( '.newItem[list=' + listID + '] .newItemBtn' );		
				
				sortingSelect.val(options.compareBy);

				//	Обработчик селекта сортировки
				sortingSelect.on('change', function() {
					//	Разобраться, почему _changeSorting($(this).val()) не работает
					switch ($(this).val()) {
						case "1": _changeSorting(1); break;
						case "2": _changeSorting(2); break;
					}
				});				
				
				//	События для contenteditable
				$('body').on('focus', '.filter[list=' + listID + '] .filterText', function() {
					var $this = $(this);
					$this.data('before', $this.html());
					return $this;
				}).on('blur keyup paste input', '.filter[list=' + listID + '] .filterText', function() {
					var $this = $(this);
					if ($this.data('before') !== $this.html()) {
						$this.data('before', $this.html());
						$this.trigger('change');
					}
					return $this;
				});
				
				//	Обработчик поля фильтра
				filterText.change(function() {
					filter = $(this).text();
					BuildList(1);
					return false;
				});
				
				//	Обработчик кнопки добавления нового элемента
				newItemBtn.click(function() {
					//	Получаем новое имя из инпута
					var v = newItemInput.text();
					_addNewItem(v);
					return false;
				});				

			}		
			
			BuildList(0);
		};
	 
		return this.each(setup); 
	};
})(jQuery);





