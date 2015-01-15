$(document).ready(
		function() {

			var restApiUrl = 'http://localhost:8080/RestApi/rest';

			$('#searchById').click(function(event) {
				event.preventDefault();
				var carId = $('input[type=search]').val();
				if (carId) {
					var url = restApiUrl + '/car/id/' + carId;
					$.ajax({
						type : 'GET',
						url : url,
						dataType : 'json',
						success : function(response) {
							if (hasData(response)) {
								var car = getData(response);
								$("#searchResult").html(car.mark+" "+car.model+" "+car.modification);
							} 
						},
						error : function(error) {
							$("#searchResult").empty();
						}
					});
				} else {
					$("#searchResult").empty();
				}
			});

			$("#getAllCars").click(
					function(e) {
						e.preventDefault();
						if($(".cars .carslist").css('display') != 'none'){
							console.log('Car list is visible');
							$(".cars .carslist").hide('fast');
							return;
						}
						var url = restApiUrl + '/car/marks';
						$.ajax({
							type : 'GET',
							url : url,
							dataType : 'json',
							success : function(response) {
								if(hasData(response)){
									var data = getData(response);
									$("#marks").empty();
									$.each(data, function(index, element) {
										var mark = $("<li><a href='#' name='"
												+ element.id + "' >" + element.mark
												+ "</a></li>");
										$("#marks").append(mark);
									});
									$(".cars .carslist").show('fast');
								}

							},
							error : function(error) {
								$(".cars .carslist").hide('fast');
							},
							beforeSend : function(){
								$(".cars .status").html("Loading...");
							},
							complete : function(){
								$(".cars .status").empty();
							}
						});
					});

			$("#marks").on(
					'click',
					'a',
					function(e) {
						e.preventDefault();
						var markId = this.name;
						var url = restApiUrl + '/car/mark/' + markId
								+ '/models';
						$.ajax({
							type : 'GET',
							url : url,
							dataType : 'json',
							success : function(response) {
								if(hasData(response)){
									var data = getData(response);
									console.log(data);
									$("#models").empty();
									$("#modifications").empty();
									$.each(data, function(index, element) {
										var model = $("<li><a href='#' name='"
												+ element.id + "' >"
												+ element.model + "</a></li>");
										$("#models").append(model);
									});
								}

							},
							error : function(error) {
								console.log(error);
							}
						});
					})

			$("#models").on(
					'click',
					'a',
					function(e) {
						e.preventDefault();
						var modelId = this.name;
						var url = restApiUrl + '/car/model/' + modelId
								+ '/modifications';
						$.ajax({
							type : 'GET',
							url : url,
							dataType : 'json',
							success : function(response) {
								var data = response.data;
								console.log(data);
								$("#modifications").empty();
								$.each(data, function(index, element) {
									$("#modifications").append(
											"<li>" + element.modification
													+ "</li>");
								});

							},
							error : function(error) {
								console.log(error);
							}
						});
					})

			$("#addNewCar").submit(function(e) {
				e.preventDefault();
				var url = restApiUrl + '/car/new';
				
				var data = serializeArrayWrap($(this));
				console.log(data);
				var errorField = getErrorFields(data);
				if(errorField.length > 0){
					$("#addNewCar").parent().find(".result").removeClass('success').addClass('error').html(errorField.join(', '));
					return;
				}
				$.ajax({
					type : 'POST',
					url : url,
					dataType : 'json',
					contentType: "application/json",
					data : JSON.stringify(data),
					success : function(response) {
						console.log(response);
						var status = $("#addNewCar").parent().find(".result");
						console.log(status);
						status.toggleClass("loading");
						if(hasException(response)){
							var exception = getException(response);
							console.log('Has exception:'+exception);
							status.html(getException(response)).removeClass('success').addClass('error');
						} else {
							status.html(getData(response)).removeClass('error').addClass('success');
						}
					},
					beforeSend : function(){
						$("#addNewCar").parent().find(".result").html("Loading...").toggleClass("loading");
					}
				});
			})
			
			function hasException(response){
				return response.exception.status>0;
			}
			
			function getException(response){
				return !response.exception.exceptionMessage
						?"Unknown error"
						:response.exception.exceptionMessage;
			}
			
			function hasData(response){
				return !hasException(response) && response.data;
			}
			
			function getData(response){
				return response.data;
			}
			
			function getErrorFields(car){
				var result = [];
				$.each(car,function(key, value){
					if(!value || value.lenth<3){
						result.push(key);
					}
				});
				return result;
			}
			
			function serializeArrayWrap(form){
				var rawData = form.serializeArray();
				var resultData={};
				$.each(rawData, function(idx, element){
					resultData[element.name]=element.value;
				});
				return resultData;
			}
		});