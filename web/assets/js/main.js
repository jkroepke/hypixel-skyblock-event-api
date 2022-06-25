const allCrops = [
  "Cactus",
  "Sugar Cane",
  "Nether Wart",
  "Wheat",
  "Mushroom",
  "Cocoa Beans",
  "Potato",
  "Melon",
  "Pumpkin",
  "Carrot",
];

function diffToString(diff) {
  let dateFormatted = "";
  diff.subtract(1, "hour");
  if (diff.second() > 0) {
    dateFormatted =
      (diff.second() < 10 ? "0" + diff.second() : diff.second()) + "s";
  }
  if (diff.minute() > 0) {
    dateFormatted =
      (diff.minute() < 10 ? "0" + diff.minute() : diff.minute()) +
      "m " +
      dateFormatted;
  }
  if (diff.hour() > 0) {
    dateFormatted =
      (diff.hour() < 10 ? "0" + diff.hour() : diff.hour()) +
      "h " +
      dateFormatted;
  }
  if (diff.dayOfYear() - 1 > 0) {
    dateFormatted = diff.dayOfYear() - 1 + "d " + dateFormatted;
  }
  return dateFormatted;
}

function appendContestTime(parent, datetime) {
  if (!parent) return;

  let diff;
  let dateFormatted;

  if (moment(datetime).diff(moment()) > 0) {
    diff = moment(moment(datetime).diff(moment()));
    dateFormatted = "Starts in: " + diffToString(diff);
    if (moment(datetime).diff(moment()) < 300000) {
      parent.classList.remove("bg-light");
      parent.classList.add("bg-warning");
    } else {
      parent.classList.remove("bg-light");
      parent.classList.add("bg-success");
    }
  } else {
    diff = moment(moment(moment()).diff(datetime));
    dateFormatted = "Starts: " + diffToString(diff) + " ago";
    parent.classList.remove("bg-light");
    parent.classList.add("bg-danger");
  }
  parent.querySelector("h6").innerText = dateFormatted;
}

async function loadData() {
  try {
    const response = await fetch("data/index.json");
    if (response.status === 200) {
      const years = await response.json();

      const requestYears = Object.keys(years)
        .filter((year) => {
          return years[year].to >= Date.now();
        })
        .map((year) => {
          return fetch(years[year].url).then((res) => res.json());
        });

      return Object.assign({}, ...(await Promise.all(requestYears)));
    }
  } catch (error) {
    console.error(error);
  }
}

function updateContestsTime() {
  Array.prototype.forEach.call(
    document.getElementsByClassName("contest"),
    (el) => {
      let datetime = new Date(parseInt(el.getAttribute("data-time")));
      if (moment(datetime).diff(moment()) > -1200000) {
        appendContestTime(el, datetime);
      } else {
        el.parentNode.removeChild(el);
      }
    }
  );

  updateContestsCount();
}

function updateContestsCount() {
  const count = document.getElementsByClassName("contest").length;
  document.querySelector(
    "#contest_list>h5:first-child"
  ).innerHTML = `${count} contest${count > 1 ? "s" : ""} found`;
}

(async () => {
  let cropList = Array();
  let allFarmingContests = await loadData();

  function appendCrop(parent, crop) {
    let imgPath = "";
    let name = "";
    switch (crop) {
      case "Nether Wart":
        imgPath = "./assets/img/nether_wart.png";
        name = "Nether wart";
        break;
      case "Sugar Cane":
        imgPath = "./assets/img/sugar_cane.png";
        name = "Sugar cane";
        break;
      case "Wheat":
        imgPath = "./assets/img/wheat.png";
        name = "Wheat";
        break;
      case "Cactus":
        imgPath = "./assets/img/cactus.png";
        name = "Cactus";
        break;
      case "Mushroom":
        imgPath = "./assets/img/mushroom.png";
        name = "Mushroom";
        break;
      case "Cocoa Beans":
        imgPath = "./assets/img/cocoa_beans.png";
        name = "Cocoa beans";
        break;
      case "Potato":
        imgPath = "./assets/img/potato.png";
        name = "Potato";
        break;
      case "Melon":
        imgPath = "./assets/img/melon.png";
        name = "Melon";
        break;
      case "Pumpkin":
        imgPath = "./assets/img/pumpkin.png";
        name = "Pumpkin";
        break;
      case "Carrot":
        imgPath = "./assets/img/carrot.png";
        name = "Carrot";
        break;
    }

    parent.innerHTML =
      parent.innerHTML +
      `<div class="col-md-4 crop-item" data-crop="${crop}"><img src="${imgPath}" class="crop-img" alt="${name}"><p>${name}</p></div>`;

    document
      .querySelector(".crop-item:last-child")
      .addEventListener("click", () => {
        loadContests([crop]);
        document
          .querySelectorAll(".btn.btn-primary[data-crop]")
          .forEach((el) => {
            el.classList.add("btn-info");
            el.classList.remove("btn-primary");
          });
        document
          .querySelectorAll(`.btn.btn-info[data-crop="${crop}"]`)
          .forEach((el) => {
            el.classList.add("btn-primary");
            el.classList.remove("btn-info");
          });

        cropList = Array(crop);
      });
  }

  function loadContests(items = allCrops) {
    let contest_list = document.getElementById("contest_list");
    while (contest_list.firstChild)
      contest_list.removeChild(contest_list.firstChild);

    const count = Object.keys(allFarmingContests)
      .filter((time) =>
        allFarmingContests[time].some((crop) => items.includes(crop))
      )
      .filter(
        (time) => moment(new Date(parseInt(time))).diff(moment()) > -1200000
      )
      .sort()
      .map((time) => {
        contest_list.innerHTML =
          contest_list.innerHTML +
          `<div id="event-${time}" data-time="${time}" class="justify-content-center text-center mx-auto col-lg-6 contest bg-light"><h6></h6><div class="crops row gx-0"></div></div>`;

        const el = document.getElementById(`event-${time}`);
        appendContestTime(el, new Date(parseInt(time)));

        const elCrops = el.querySelector(`.crops`);
        allFarmingContests[time].forEach((crop) => appendCrop(elCrops, crop));

        return time;
      }).length;

    contest_list.innerHTML =
      `<h5 class="text-center pt-2">${count} contests found</h5>` +
      contest_list.innerHTML;

    if (count === 0) {
      contest_list.innerHTML =
        contest_list.innerHTML +
        "<h6 class='text-center'>No contests were found, if it's new year or Hypixel is down, be patient, contests will return soon</h6>";
    }
  }

  loadContests();

  setInterval(function () {
    updateContestsTime();
  }, 1000);

  document.querySelectorAll(".btn[data-crop]").forEach((element) => {
    element.addEventListener("click", () => {
      // https://dommagnifi.co/2016-05-16-basic-class-toggle-with-vanilla-js/
      element.classList.toggle("btn-info");
      element.classList.toggle("btn-primary");

      let cropName = element.getAttribute("data-crop");
      if (cropList.includes(cropName)) {
        cropList = cropList.filter((item) => item !== cropName);
      } else {
        cropList.push(cropName);
      }

      if (cropList.length > 0) {
        loadContests(cropList);
      } else {
        loadContests();
      }
    });
  });
})();
