import { useState } from 'react';
import './App.css';

const REASONS = [
	'なんとなく良い感じがしたから',
	'AIの直感です！',
	'この日が運命の日だと思うから',
	'宇宙からのメッセージを受信しました',
	'サイコロを振ったらこうなりました',
	'今日の気分的にこの日！',
	'きっと良いことがある日だから',
	'特に理由はないけど、これで決まり！',
	'この日なら間違いない（たぶん）',
	'占い的な何かでこの日が良いらしい',
	'ランダムだけど、運命的な選択です',
	'AIが3秒考えた結果です',
	'この日が一番輝いて見えたから',
	'フィーリングで選びました',
	'深い理由があるような、ないような...',
];

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function App() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDates, setSelectedDates] = useState(new Set());
	const [isRouletteActive, setIsRouletteActive] = useState(false);
	const [rouletteDisplay, setRouletteDisplay] = useState('');
	const [result, setResult] = useState(null);
	const [isSpinning, setIsSpinning] = useState(false);

	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth();

	// カレンダーの日付を生成
	const generateCalendarDays = () => {
		const firstDay = new Date(currentYear, currentMonth, 1).getDay();
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const days = [];

		// 空のセル
		for (let i = 0; i < firstDay; i++) {
			days.push({ type: 'empty', key: `empty-${i}` });
		}

		// 日付
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentYear, currentMonth, day);
			const dateStr = formatDateStr(currentYear, currentMonth, day);
			const isPast = date < today;
			const isSelected = selectedDates.has(dateStr);

			days.push({
				type: 'day',
				day,
				dateStr,
				isPast,
				isSelected,
				key: `day-${day}`,
			});
		}

		return days;
	};

	const formatDateStr = (year, month, day) => {
		return `${year}/${month + 1}/${day}`;
	};

	const formatDisplayDate = (dateStr) => {
		const [_year, month, day] = dateStr.split('/');
		return `${month}月${day}日`;
	};

	const changeMonth = (direction) => {
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + direction);
		setCurrentDate(newDate);
	};

	const toggleDate = (dateStr) => {
		const newSelected = new Set(selectedDates);

		if (newSelected.has(dateStr)) {
			newSelected.delete(dateStr);
		} else {
			if (newSelected.size >= 10) {
				alert('最大10個まで選択できます！');
				return;
			}
			newSelected.add(dateStr);
		}

		setSelectedDates(newSelected);
	};

	const playClickSound = () => {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.value = 800 + Math.random() * 400;
		gainNode.gain.value = 0.1;

		oscillator.start();
		oscillator.stop(audioContext.currentTime + 0.05);
	};

	const playVictorySound = () => {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const notes = [523.25, 659.25, 783.99]; // C, E, G

		notes.forEach((freq, i) => {
			setTimeout(() => {
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();

				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);

				oscillator.frequency.value = freq;
				gainNode.gain.value = 0.2;
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

				oscillator.start();
				oscillator.stop(audioContext.currentTime + 0.5);
			}, i * 150);
		});
	};

	const startRoulette = () => {
		if (selectedDates.size < 2) {
			alert('2つ以上の日付を選択してください！');
			return;
		}

		const datesArray = Array.from(selectedDates);
		setIsRouletteActive(true);
		setIsSpinning(true);
		setResult(null);

		let count = 0;
		const maxCount = 20 + Math.floor(Math.random() * 10);

		const interval = setInterval(() => {
			const randomDate = datesArray[Math.floor(Math.random() * datesArray.length)];
			setRouletteDisplay(formatDisplayDate(randomDate));
			playClickSound();

			count++;

			if (count >= maxCount) {
				clearInterval(interval);
				finishRoulette(datesArray);
			}
		}, 100);
	};

	const finishRoulette = (datesArray) => {
		const finalDate = datesArray[Math.floor(Math.random() * datesArray.length)];
		setRouletteDisplay(formatDisplayDate(finalDate));
		setIsSpinning(false);

		playVictorySound();

		setTimeout(() => {
			setIsRouletteActive(false);
			setResult({
				date: finalDate,
				reason: REASONS[Math.floor(Math.random() * REASONS.length)],
			});
		}, 1500);
	};

	const resetSelection = () => {
		setSelectedDates(new Set());
		setResult(null);
	};

	const monthNames = [
		'1月',
		'2月',
		'3月',
		'4月',
		'5月',
		'6月',
		'7月',
		'8月',
		'9月',
		'10月',
		'11月',
		'12月',
	];

	return (
		<div className="app">
			<div className="container">
				<h1>🎯 ひどりん 🎯</h1>
				<p className="subtitle">
					決められないあなたの代わりに、適当に日取りを決めちゃいます！
				</p>

				<div className="calendar-container">
					<div className="month-header">
						<button onClick={() => changeMonth(-1)}>◀</button>
						<div className="month-label">
							{currentYear}年 {monthNames[currentMonth]}
						</div>
						<button onClick={() => changeMonth(1)}>▶</button>
					</div>

					<div className="weekdays">
						{WEEKDAYS.map((day) => (
							<div key={day} className="weekday">
								{day}
							</div>
						))}
					</div>

					<div className="days">
						{generateCalendarDays().map((day) => {
							if (day.type === 'empty') {
								return <div key={day.key} className="day empty"></div>;
							}

							return (
								<div
									key={day.key}
									className={`day ${day.isPast ? 'disabled' : ''} ${
										day.isSelected ? 'selected' : ''
									}`}
									onClick={() => !day.isPast && toggleDate(day.dateStr)}
								>
									{day.day}
								</div>
							);
						})}
					</div>
				</div>

				<div className="selected-dates">
					<h3>選択した日付（最大10個）: {selectedDates.size}/10</h3>
					<div className="date-chips">
						{Array.from(selectedDates)
							.sort()
							.map((dateStr) => (
								<div key={dateStr} className="date-chip">
									{formatDisplayDate(dateStr)}
								</div>
							))}
					</div>
				</div>

				{!result && (
					<button
						className="decide-button"
						onClick={startRoulette}
						disabled={selectedDates.size < 2}
					>
						🎲 決めてもらう！ 🎲
					</button>
				)}

				{result && (
					<div className="result-container">
						<div className="result-title">✨ 決定しました！ ✨</div>
						<div className="result-date">{formatDisplayDate(result.date)}</div>
						<div className="result-reason">「{result.reason}」</div>
						<button className="reset-button" onClick={resetSelection}>
							もう一度選ぶ
						</button>
					</div>
				)}
			</div>

			{isRouletteActive && (
				<div className="roulette-container">
					<div className="roulette-box">
						<h2>🎰 選んでます... 🎰</h2>
						<div className={`roulette-display ${isSpinning ? 'spinning' : ''}`}>
							{rouletteDisplay}
						</div>
						<p>AIが真剣に考えています（嘘）</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
