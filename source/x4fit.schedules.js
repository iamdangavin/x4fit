import moment from "moment";

class x4 {
	constructor(options = {}) {
		this._options = {
			location: null,
			minDate: null,
			maxDate: null,
			pageSize: 200,
			...options
		};
		this._week = {};
	}

	async fetchSchedule() {
		this._week = this.getCurrentWeek();
		const fetchPromises = [];

		for (const day of this._week.dates) {
			const dayName = moment(day).format("ddd");

			// Create a promise chain for each day
			const promise = this.getSchedule(day, day).then((data) => {
				const eventsHtmlPromises = data.data.map((item) => {
					// Make the second API call for each item if classId is available
					const classId = item.id; // Replace with the actual property name
					if (classId) {
						return this.getClass(classId).then((classData) => {
							item.details = classData; // Append details to the item
							return item;
						});
					} else {
						return item; // If classId is not available, return the item as is
					}
				});

				// Wait for all eventsHtmlPromises to resolve
				return Promise.all(eventsHtmlPromises).then((itemsWithDetails) => {
					const eventsHtml = itemsWithDetails
						.map((item) => {
							return `
							<div class="schedule_blocks-item">
								<div class="schedule_blocks-times">
									<div class="schedule_blocks-time heading-2">${moment(
										item.attributes.start_datetime
									).format("h:mma")}</div>
									<div class="schedule_blocks-duration">${
										item.attributes.duration
									}min</dib>
								</div>
								<div class="schedule_blocks-details">
									<figure class="schedule_blocks-image">
										${
											item.details && item.details.instructors.length
												? `<img class="schedule_blocks-img" src="${item.details.instructors[0].photo_urls.thumbnail_url}" />`
												: ``
										}
									</figure>
									<div class="details">
										<div class="schedule_blocks-title">${
											item.attributes.public_note ??
											item.attributes.class_type_display
										}</div>
										<div class="schedule_blocks-coach">${
											item.attributes.instructor_names[0] ?? ""
										}</div>
									</div>
								</div>
							</div>
						`;
						})
						.join("");

					const tabSelector = `[data-w-tab="${dayName}"]`;
					const dayElement = document.querySelector(tabSelector);
					if (dayElement) {
						dayElement.innerHTML = `<div class="schedule_blocks">${eventsHtml}</div>`;
					}
					return "";
				});
			});

			fetchPromises.push(promise);
		}

		// Promise.all(fetchPromises)
		//   .catch((error) => {
		//     console.error("Error fetching data:", error);
		//   });
		return Promise.all(fetchPromises);
	}

	async getSchedule(minDate = null, maxDate = null) {
		const mariana = await fetch(
			`https://xfourfitness.marianatek.com/api/class_sessions?min_date=${minDate}&max_date=${maxDate}&page_size=${this._options.pageSize}&ordering=start_datetime&location=${this._options.location}`,
			{
				method: "GET"
			}
		);
		return await mariana.json();
	}

	async getClass(id) {
		const mariana = await fetch(
			`https://xfourfitness.marianatek.com/api/customer/v1/classes/${id}`,
			{
				method: "GET"
			}
		);
		return await mariana.json();
	}

	getCurrentWeek() {
		const currentDate = new Date();
		const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
		const startDate = new Date(currentDate);
		const endDate = new Date(currentDate);

		// Calculate the start date (Sunday) of the current week
		startDate.setDate(currentDate.getDate() - currentDayOfWeek);

		// Calculate the end date (Saturday) of the current week
		endDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek));

		const formatDate = (date) => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		};
		const weekDates = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			weekDates.push(formatDate(date));
		}

		return {
			startDate: formatDate(startDate),
			endDate: formatDate(endDate),
			dates: weekDates
		};
	}

	formatDatetimeString(datetimeString, format) {
		const options = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZoneName: "short"
		};

		const formattedDate = new Date(datetimeString).toLocaleString(
			undefined,
			options
		);

		return formattedDate;
	}
}

export default x4;