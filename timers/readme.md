# Менеджер таймеров
---


## Задание 1

Реализовать менеджер таймеров

```js
class TimersManager {
	constructor() {
		this.timers = [];
	}

	add() {}

	remove() {}

	start() {}

	stop() {}

	pause() {}

	resume() {}
}

const manager = new TimersManager();

const t1 = {
	name: 't1',
	delay: 1000,
	interval: false,
	job: () => { console.log('t1') }
};

const t2 = {
	name:'t2',
	delay:1000,
	interval: false,
	job:(a, b) => a + b
};

manager.add(t1);
manager.add(t2, 1, 2);
manager.start();
console.log(1);
manager.pause('t1');
```

- Метод *add* должен добавлять таймер в очередь на выполнение. В качестве первого параметра этот метод принимает объект описывающий таймер, а все последующие параметры передаются как аргументы для callback функции таймера.
- Вызовы метода *add* можно соединять `manager.add(t1).add(t2, 1, 2)`
- Метод *remove* должен остановить определённый таймер и удалить его из очереди.
- Метод *start* должен запустить все таймеры на выполнение.
- Метод *stop* должен остановить все таймеры.
- Метод *pause* приостанавливает работу конкретного таймера.
- Метод *resume* запускает работу конкретного таймера.
- Таймеры могут быть как одноразовыми (выполнить задачу через определённый промежуток времени), так и периодическими (выполнять задачу с определённым интервалом). Если *interval* = true — таймер периодический.

##### Обратите внимание!
1. TimeManager должен вызывать ошибку если поле *name* содержит неверный тип, отсутствует или пустая строка.
2. TimeManager должен вызывать ошибку если поле *delay* содержит неверный тип или отсутствует.
3. TimeManager должен вызывать ошибку если *delay* меньше 0 и больше 5000.
4. TimeManager должен вызывать ошибку если поле *interval* содержит неверный тип или отсутствует.
5. TimeManager должен вызывать ошибку если поле *job* содержит неверный тип или отсутствует.
6. TimeManager должен вызывать ошибку если запустить метод *add* после старта.
7. TimeManager должен вызывать ошибку если попытаться добавить таймер с именем которое уже было добавлено.

##### Timer:
```
{
	name*: String,      // timer name
	delay*: Number,     // timer delay in ms
	interval*: Boolean, // is timer or interval
	job*: Function,     // timer job
}
```


## Задача 2

Реализовать логгер для менеджера таймеров:
1. Необходимо добавить метод _log который будет записывать в массив логов результат выполнения колбек функции таймера.
2. Необходимо добавить метод print который будет возвращать массив всех логов.

```js
const manager = new TimersManager();

const t1 = {
	name:'t1',
	delay:1000,
	interval: false,
	job:(a, b) => a + b
};

manager.add(t1, 1, 2);
manager.start();
manager.print();
// [{ name: 't1', in: [1,2], out: 3, created: '2019-01-24T12:42:48.664Z' }]
```

*Log* объект:
```
{
	name: String,   // Timer name
	in: Array,      // Timer job arguments
	out: Any,       // Timer job result
	created: Date,  // Log time
}
```

## Задача 3

Улучшите имплементацию задачи 2.
1. Необходимо реализовать обработку ошибок возникающих внутри callback функций.
2. Если ошибка произошла, необходимо в лог добавить информацию об этой ошибке.

##### Обратите внимание!
При возникновении ошибки внутри callback функции выполнение программы не должно завершаться с ошибкой.

```js
const manager = new TimersManager();

const t1 = {
	name: 't1',
	delay: 1000,
	interval: false,
	job: (a, b) => a + b
};

const t2 = {
	name: 't2',
	delay: 1000,
	interval: false,
	job: () => throw new Error('We have a problem!')
};

const t3 = {
	name: 't3',
	delay: 1000,
	interval: false,
	job: n => n
};

manager.add(t1, 1, 2) // 3
manager.add(t2); // undefined
manager.add(t3, 1); // 1
manager.start();


setTimeout(() => {
	manager.print();
}, 2000);
/* 
	В результате вы получите массив объектов
	[
		{
			name: 't1',
			in: [1, 2],
			out: 3,
			created: '2019-01-24T12:42:48.664Z'
		},
		{
			name: 't2',
			in: [],
			out: undefined,
			error: {
				name: 'Error',
				message: 'We have a problem!',
				stack: 'stack...' // some stack trace
			},
			created: '2019-01-24T12:42:48.664Z'
		},
		{
			name: 't3',
			in: [1],
			out: 1,
			created: '2019-01-24T12:42:48.664Z'
		}
	]
*/
```

*Log* объект:
```
{
	name: String,     // Timer name
	in: Array,        // Timer job arguments
	out: Any,         // Timer job result
	error: {          // Only if the error occur
		name: String,     // Error name
		message: String,  // Error message
		stack: String     // Error stacktrace
	},
	created: Date, 	  // Log time
}
```

## Задача 4
Улучшите имплементацию задачи 3.
1. Реализовать общий таймаут для TimersManager. Время таймаута будет равняться времени самого долгого таймера + 10 секунд.
2. По истечению временного лимита TimersManager должен пройтись по всем таймерам и убить все таймеры.

```js
const manager = new TimersManager();

const t1 = {
	name: 't1',
	delay: 3000,
	interval: false,
	job: (a, b) => a + b
};

const t2 = {
	name: 't2',
	delay: 2000,
	interval: false,
	job: () => throw new Error('We have a problem!')
};

const t3 = {
	name: 't3',
	delay: 5000,
	interval: false,
	job: n => n
};

manager.add(t1, 1, 2);
manager.add(t2);
manager.add(t3, 1);
manager.start();
// Через 15 секунд все таймеры должны быть очищены
```

Автор задания: Андрей Присняк (Lectrum Education)