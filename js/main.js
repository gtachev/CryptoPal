var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
    
        $scope.getFromStorage = function(key) {
            var dataFromStorage = localStorage.getItem(key);
            if(dataFromStorage === null) {
                return null;
            }
            return JSON.parse(dataFromStorage);
        };
        $scope.setToStorage = function(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        };

        /*
	$scope.has = [
		{
			"name": "Bitcoin",
			"symbol": "BTC",
			"invested_bgn": "500",
			"withdraw_tax_percent": "2",
			"quantity": 0.11
		},
		{
			"name": "Ethereum",
			"symbol": "ETH",
			"invested_bgn": "600",
			"withdraw_tax_percent": "2.5",
			"quantity": 1.17535245
		}
	];
        */
        $scope.initHasVariable = function() {
            var has = $scope.getFromStorage('has');
            if(has === null) {
                has = [];
            }
            $scope.has = has;
        };
        $scope.initHasVariable();
        
        $scope.openEditHas = function() {
            $scope.tempHas = $scope.has;
            if($scope.tempHas.length === 0) {
                $scope.addNewEntryToHas();
            }
            $scope.showingEditHas = true;
        };
	
	$scope.addNewEntryToHas = function() {
		$scope.tempHas.push({
			"name": "Bitcoin",
			"symbol": "BTC",
			"invested_bgn": "0",
			"withdraw_tax_percent": "2.5",
			"quantity": 0
		});
	};
	
	$scope.removeEntryFromHas = function(index) {
		if (index > -1) {
			$scope.tempHas.splice(index, 1);
		}
	};
        
        $scope.cancelEditHas = function() {
            $scope.showingEditHas = false;
        };

	$scope.saveEditHas = function() {
                var tempHas = [];
                for(var i = 0; i < $scope.tempHas.length; i++) {
                    var temp = {
			"name": $scope.allCurrenciesObj[$scope.tempHas[i].symbol].name,
			"symbol": $scope.tempHas[i].symbol,
			"invested_bgn": parseFloat($scope.tempHas[i].invested_bgn),
			"withdraw_tax_percent": parseFloat($scope.tempHas[i].withdraw_tax_percent),
			"quantity": parseFloat($scope.tempHas[i].quantity)
		};
                    tempHas.push(temp);
                }
                $scope.has = tempHas;
                $scope.setToStorage('has', $scope.has);
                $scope.showingEditHas = false;
                $scope.getApiData();
	};

	$scope.chartColors = [
		'rgb(255, 99, 132)', // red
		'rgb(255, 159, 64)', // orange
		'rgb(255, 205, 86)', // yellow
		'rgb(75, 192, 192)', // green
		'rgb(54, 162, 235)', // blue
		'rgb(153, 102, 255)', // purple
		'rgb(201, 203, 207)', // grey
		'#0091CD', // brandcolors
		'#E2D7AC', //
		'#B4A996', //
		'#ECB731', //
		'#8EC06C', //
		'#537B35', //
		'#C4DFF6', //
		'#56A0D3', //
		'#004B79', //
		'#7F181B' //
	];

	$scope.config = {
		type: 'pie',
                /*
		data: {
			datasets: [{
					data: [
						1,
						2,
						3,
						4,
						5
					],
					backgroundColor: [
						$scope.chartColors[0],
						$scope.chartColors[1],
						$scope.chartColors[2],
						$scope.chartColors[3],
						$scope.chartColors[4]
					],
					label: 'Charts'
				}],
			labels: [
				"Red",
				"Orange",
				"Yellow",
				"Green",
				"Blue"
			]
		},
                */
                data: {},
		options: {
			responsive: true
		}
	};

//var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	$scope.newDate = function (days) {
		return moment().add(days, 'd');
	};

	$scope.configHistory = {
		type: 'line',
		data: {
			labels: [$scope.newDate(-4), $scope.newDate(-3), $scope.newDate(2), $scope.newDate(3), $scope.newDate(4), $scope.newDate(5), $scope.newDate(6)],
			datasets: [{
					label: "My First dataset",
					backgroundColor: $scope.chartColors[0],
					borderColor: $scope.chartColors[0],
					data: [
						1,
						2,
						5,
						3,
						2,
						1,
						4
					],
					fill: false
				}, {
					label: "My Second dataset",
					fill: false,
					backgroundColor: $scope.chartColors[1],
					borderColor: $scope.chartColors[1],
					data: [
						4,
						5,
						1,
						7,
						1,
						7,
						3
					]
				}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: 'History Chart'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			hover: {
				mode: 'nearest',
				intersect: true
			},
			scales: {
				xAxes: [{
						type: 'time',
						time: {
							displayFormats: {
								'millisecond': 'MMM DD',
								'second': 'MMM DD',
								'minute': 'MMM DD',
								'hour': 'MMM DD',
								'day': 'MMM DD',
								'week': 'MMM DD',
								'month': 'MMM DD',
								'quarter': 'MMM DD',
								'year': 'MMM DD'
							}
						}
					}]
			}
		}
	};

	$scope.updateChart = function (fullData, totalSumBTC) {
		var data = [];
		var backgroundColor = [];
		var labels = [];
		for (var i = 0; i < fullData.length; i++) {
			var percent = Math.round((fullData[i].sum_btc / totalSumBTC * 100) * 1000) / 1000;
			var sum = parseInt(fullData[i].sum_bgn_clean);
			data.push(sum);
			labels.push(fullData[i].name + ' ' + percent + '%');
			var index = i % $scope.chartColors.length;
			backgroundColor.push($scope.chartColors[index]);
		}
		$scope.config.data = {
			datasets: [{
					data: data,
					backgroundColor: backgroundColor,
					label: 'Charts'
				}],
			labels: labels
		};
//		console.log($scope.config);
		$scope.myPie.update();
	};

	$scope.updateChartHistory = function (fullData, totalSumBgnclean, totalWinBgnclean)
	{
		totalSumBgnclean = parseInt(totalSumBgnclean);
		totalWinBgnclean = parseInt(totalWinBgnclean);
		var time = moment();
		$scope.configHistory.data.labels.push(time);
		$scope.configHistory.data.datasets[0].data.push(totalSumBgnclean);
		$scope.configHistory.data.datasets[1].data.push(totalWinBgnclean);
//		console.log('before save');
//		console.log($scope.configHistory.data);
		var temp = {
			labels: [],
			datasets: [
				{
					hidden: true,
					label: "Sum BGN after withdraw",
					backgroundColor: $scope.chartColors[0],
					borderColor: $scope.chartColors[0],
					data: [],
					fill: false
				},
				{
					label: "Win BGN after withdraw",
					backgroundColor: $scope.chartColors[2],
					borderColor: $scope.chartColors[2],
					data: [],
					fill: false
				}
			]
		};
		for (var i = 0; i < $scope.configHistory.data.labels.length; i++) { // fix circular json...
			temp.labels.push($scope.configHistory.data.labels[i]);
			temp.datasets[0].data.push($scope.configHistory.data.datasets[0].data[i]);
			temp.datasets[1].data.push($scope.configHistory.data.datasets[1].data[i]);
		}
//		localStorage.setItem("history-cp", JSON.stringify(temp));
                $scope.setToStorage("history-cp", temp);
		$scope.myLine.update();
	};

	$scope.numberWithSpaces = function (x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	};

	$scope.displayMyData = function (fullData) {
//		var resTable = '';
		var resTableArr = [];
//				var totalWinUsd = 0;
//				var totalWinBgn = 0;
		var totalSumUsd = 0;
		var totalSumBgn = 0;
		var totalSumInvestedBgn = 0;
		var totalWinBgnclean = 0;
		var totalSumBgnclean = 0;
		var totalSumBTC = 0;
		for (var i = 0; i < fullData.length; i++) {
//					fullData[i].win_usd = fullData[i].quantity * (fullData[i].price_usd - fullData[i].old_price_usd);
			fullData[i].win_bgn = fullData[i].quantity * (fullData[i].price_bgn - fullData[i].old_price_bgn);
			fullData[i].sum_usd = fullData[i].quantity * fullData[i].price_usd;
			fullData[i].sum_bgn = fullData[i].quantity * fullData[i].price_bgn;
			fullData[i].win_bgn_clean = fullData[i].win_bgn - Math.abs((fullData[i].quantity * fullData[i].price_bgn) * (fullData[i].withdraw_tax_percent / 100));
			fullData[i].sum_bgn_clean = (fullData[i].quantity * fullData[i].price_bgn) * ((100 - fullData[i].withdraw_tax_percent) / 100);
			fullData[i].sum_btc = fullData[i].quantity * fullData[i].price_btc;
//					totalWinUsd += fullData[i].win_usd;
//					totalWinBgn += fullData[i].win_bgn;
			totalSumUsd += fullData[i].sum_usd;
			totalSumBgn += fullData[i].sum_bgn;
			totalSumInvestedBgn += parseInt(fullData[i].invested_bgn);
//					totalWinBgnclean += fullData[i].win_bgn_clean;
			totalSumBgnclean += fullData[i].sum_bgn_clean;
			totalSumBTC += fullData[i].sum_btc;
			totalWinBgnclean = totalSumBgnclean - totalSumInvestedBgn;

			var resObj = {
				currencyName: fullData[i].name,
				hasQuantity: fullData[i].quantity,
				investedBgn: $scope.numberWithSpaces(parseInt(fullData[i].invested_bgn)),
				priceUsd: fullData[i].price_usd,
				priceBtc: fullData[i].price_btc,
				sumBtc: (Math.round(fullData[i].sum_btc * 1000) / 1000),
				sumBgnClean: $scope.numberWithSpaces(parseInt(fullData[i].sum_bgn_clean)),
				winBgnClean: $scope.numberWithSpaces(parseInt(fullData[i].win_bgn_clean)),
				change24h: (Math.round(fullData[i].percent_change_24h * 100) / 100)
			};
			resTableArr.push(resObj);
			/*
			resTable += '<tr>'
					+ '<td class="text-nowrap">' + fullData[i].name + '</td>'
					+ '<td>' + fullData[i].quantity + '</td>'
//							+ '<td class="color3">' + fullData[i].old_price_usd + '</td>'
					//+ '<div>' + fullData[i].old_price_bgn + '</div>'
					+ '<td>' + $scope.numberWithSpaces(parseInt(fullData[i].invested_bgn)) + '</td>'
					+ '<td class="color3">' + fullData[i].price_usd + '</td>'
					+ '<td class="color3">' + fullData[i].price_btc + '</td>'
					//+ '<div>' + fullData[i].price_bgn + '</div>'
					//+ '<div>' + $scope.numberWithSpaces(parseInt(fullData[i].sum_usd)) + '</div>'
					//+ '<div>' + $scope.numberWithSpaces(parseInt(fullData[i].sum_bgn)) + '</div>'
					+ '<td>' + Math.round(fullData[i].sum_btc * 1000) / 1000 + '</td>'
					+ '<td>' + $scope.numberWithSpaces(parseInt(fullData[i].sum_bgn_clean)) + '</td>'
					+ '<td class="color3">' + $scope.numberWithSpaces(parseInt(fullData[i].win_bgn_clean)) + '</td>'
					+ '<td>' + Math.round(fullData[i].percent_change_24h * 100) / 100 + '&#37;</td>'
//							+ '<div>' + parseInt(fullData[i].win_usd) + '</div>'
//							+ '<div>' + parseInt(fullData[i].win_bgn) + '</div>'
//							+ '<div>' + parseInt(fullData[i].win_bgn_clean) + '</div>'
					+ '</tr>';
			*/
		}
//		$("#results-table").html(resTable);
		$scope.resTableArr = resTableArr;
		console.log(resTableArr);
		/*
		var restText = '';
		restText += '<p class="alert">1 USD is currently ' + 1 / bgnToUsd + ' BGN</p>';
		restText += '<h4 class="alert alert-dark">Total invested ' + $scope.numberWithSpaces(parseInt(totalSumInvestedBgn)) + ' BGN</h4>';
		//restText += '<h4 class="alert alert-dark">Total sum ' + $scope.numberWithSpaces(parseInt(totalSumUsd)) + ' USD, ' + $scope.numberWithSpaces(parseInt(totalSumBgn)) + ' BGN ';
		restText += '<h4 class="alert alert-dark">Overall ' + Math.round(totalSumBTC * 1000) / 1000 + ' BTC</h4>';
		restText += '<h4 class="alert alert-dark">After withdraw ' + $scope.numberWithSpaces(parseInt(totalSumBgnclean)) + ' BGN</h4>';
		restText += '<h4 class="alert alert-dark">Total win after withdraw ' + $scope.numberWithSpaces(parseInt(totalWinBgnclean)) + ' BGN</h4>';
		//res += '<h4 class="alert alert-dark">Имаш за ' + $scope.numberWithSpaces(Math.floor(parseFloat(totalWinBgnclean)/1.2)) + ' кенчета Шуменско</h4>';
		restText += '<h4 class="alert alert-dark">Имаш за ' + (parseFloat(totalWinBgnclean) / 569835.31) + ' Lamborghini Aventador S</h4>';
		*/
		var lamboPercent = Math.round((parseFloat(totalWinBgnclean) / 569835.31) * 100);
		var lamboPercentClass = 'progress-bar-danger';
		if (lamboPercent >= 10) {
			lamboPercentClass = 'progress-bar-warning';
		}
		if (lamboPercent >= 20) {
			lamboPercentClass = 'progress-bar-info';
		}
		if (lamboPercent >= 50) {
			lamboPercentClass = 'progress-bar-success';
		}
		/*
		restText += '<div class="progress"><div class="progress-bar ' + lamboPercentClass + '" role="progressbar" aria-valuenow="' + lamboPercent + '" aria-valuemin="0" aria-valuemax="100" style="width:' + lamboPercent + '%"><span class="">' + lamboPercent + '%</span></div></div>';
		$("#results-text").html(restText);
		*/
		
		$scope.restTextObj = {
			displayCurrency: "BGN",
			oneUsdToBgn: (1 / bgnToUsd),
			totalInvested: $scope.numberWithSpaces(parseInt(totalSumInvestedBgn)),
			totalSumBtc: (Math.round(totalSumBTC * 1000) / 1000),
			afterWithdraw: $scope.numberWithSpaces(parseInt(totalSumBgnclean)),
			winAfterWithdraw: $scope.numberWithSpaces(parseInt(totalWinBgnclean)),
			partOfLambo: (parseFloat(totalWinBgnclean) / 569835.31),
			lamboPercent: lamboPercent,
			lamboPercentClass: lamboPercentClass
		};
		console.log($scope.restTextObj);
		
		$scope.updateChart(fullData, totalSumBTC);
		$scope.updateChartHistory(fullData, totalSumBgnclean, totalWinBgnclean);
	};

	var bgnToUsd;
	$scope.updateMyData = function (data) {
//		bgnToUsd = 0.625; //data[0].market_cap_usd / data[0].market_cap_bgn;
		var usdToBgn = data[0].market_cap_bgn / data[0].market_cap_usd;
		bgnToUsd = 1/usdToBgn;
		for (var i = 0; i < $scope.has.length; i++) {
			for (var j = 0; j < data.length; j++) {
				if ($scope.has[i].name === data[j].name || (null == data[j].name && $scope.has[i].symbol === data[j].symbol)) {
					$scope.has[i].price_usd = data[j].price_usd;
					$scope.has[i].price_btc = data[j].price_btc;
					$scope.has[i].price_bgn = data[j].price_usd * (1 / bgnToUsd); //data[j].price_bgn;
					$scope.has[i].percent_change_1h = data[j].percent_change_1h;
					$scope.has[i].percent_change_24h = data[j].percent_change_24h;
					$scope.has[i].percent_change_7d = data[j].percent_change_7d;

					$scope.has[i].old_price_bgn = $scope.has[i].invested_bgn / $scope.has[i].quantity;
					$scope.has[i].old_price_usd = $scope.has[i].old_price_bgn * bgnToUsd;
				}
			}
		}
//		console.log($scope.has);
		$scope.displayMyData($scope.has);
	};

	$scope.prepareCryptocompareData = function (data) {
		var newData = [];
		for (var key in data.RAW) {
			if (!data.RAW.hasOwnProperty(key))
				continue;
			var temp = {};
			temp.symbol = data.RAW[key].USD.FROMSYMBOL;
			temp.price_usd = data.RAW[key].USD.PRICE;
			temp.price_bgn = data.RAW[key].BGN.PRICE;
			temp.price_btc = data.RAW[key].BTC.PRICE;
			if (key === 'BTC') { // fix some weird api error
				temp.price_btc = 1;
			}
			temp.market_cap_usd = data.RAW[key].USD.MKTCAP;
			temp.market_cap_bgn = data.RAW[key].BGN.MKTCAP;
			temp.percent_change_24h = data.RAW[key].USD.CHANGE24HOUR / (data.RAW[key].USD.PRICE / 100);
			newData.push(temp);
		}
		return newData;
	};

	$scope.getApiDataUrl = function (provider) {
		if (provider === 'coinmarketcap') {
			return 'https://api.coinmarketcap.com/v1/ticker/?convert=BGN&limit=1500';
		} else if (provider === 'cryptocompare') { // //https://www.cryptocompare.com/api/#-api-data-price-
			var symbols = [];
			for (var i = 0; i < $scope.has.length; i++) {
				symbols.push($scope.has[i].symbol);
			}
			var symbolsString = symbols.join(',');
			var apiUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + symbolsString + '&tsyms=BTC,USD,BGN';
			return apiUrl;
		}
	};

	$scope.get = function (url) {
		return $http({
			method: 'GET',
			url: url
		});
	};

	$scope.getApiData = function () {
		var provider = $scope.providerSelect; // cryptocompare||coinmarketcap
		var apiUrl = $scope.getApiDataUrl(provider);

//		console.log(apiUrl);
		$scope.get(apiUrl).then(function (response) {
			var data = response.data
			if (provider === 'cryptocompare') {
				data = prepareCryptocompareData(data);
			}
                        $scope.allCurrenciesObj = {};
			for(var i = 0; i < data.length; i++) {
				$scope.allCurrenciesObj[data[i].symbol] = data[i];
			}
			$scope.allCurrencies = data.slice(0, 200);
//			console.log(data);
                        if(!$scope.has.length) {
                            return;
                        }
			$scope.updateMyData(data);
			var time = new Date();
			$('#last_updated').html(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ' @' + provider);
		});
	};

	$scope.loadCharts = function () {
//		console.log('onload here');
		var ctx = document.getElementById("chart-area-pie").getContext("2d");
		$scope.myPie = new Chart(ctx, $scope.config);

//		if (localStorage.getItem("history-cp") === null) {
		if ($scope.getFromStorage("history-cp") === null) {
			var data = {
				labels: [],
				datasets: [{
						hidden: true,
						label: "Sum BGN after withdraw",
						backgroundColor: $scope.chartColors[0],
						borderColor: $scope.chartColors[0],
						data: [],
						fill: false
					},
					{
						label: "Win BGN after withdraw",
						backgroundColor: $scope.chartColors[2],
						borderColor: $scope.chartColors[2],
						data: [],
						fill: false
					}
				]
			};
//			localStorage.setItem("history-cp", JSON.stringify(data));
			$scope.setToStorage("history-cp", data);
		}
//		$scope.configHistory.data = JSON.parse(localStorage.getItem("history-cp"));
		$scope.configHistory.data = $scope.getFromStorage("history-cp");

//				console.log('config history');
//				console.log(configHistory.data);
		var ctxHistory = document.getElementById("chart-area-history").getContext("2d");
		$scope.myLine = new Chart(ctxHistory, $scope.configHistory);
//				console.log(newDate(-4));
	};

	$scope.providerSelect = 'coinmarketcap';
	$scope.loadCharts();
	$scope.getApiData();
});
