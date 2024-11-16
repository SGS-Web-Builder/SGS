const PAYMENT_TYPE_MAP = {
  UPI_1: "UPI_1",
  UPI_2: "UPI_2",
  USDT_1: "USDT_1",
};

const PAYMENT_CHANNEL_MAP = {
  UPI_1: {
    ICEPAY: "ICEPAY",
    A7Days: "A7Days",
    PAILEPAY: "PAILEPAY",
    RSPAY: "RSPAY",
  },
  UPI_2: {
    ICEPAY: "ICEPAY",
    A7Days: "A7Days",
    PAILEPAY: "PAILEPAY",
    RSPAY: "RSPAY",
  },
  USDT_1: {
    UPAY: "UPAY",
    USDT_MANUAL: "USDT_MANUAL",
  },
};

const defaultState = {
  paymentType: PAYMENT_TYPE_MAP.UPI_1,
  paymentChannel: PAYMENT_CHANNEL_MAP.UPI_1.ICEPAY,
  deposit_amount: "",
};

const PAYMENT_CHANNEL_HTML = {
  UPI_1: `
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="ICEPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-Icepay</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="A7Days">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-7Days</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="PAILEPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-Pailepay</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="RSPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-Rspay</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
  `,
  UPI_2: `
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="ICEPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-Icepay</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="A7Days">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-7Days</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="PAILEPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-Pailepay</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="RSPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">APP-Rspay</div>
            <div data-v-9e03166f="">Balance:200 - 50K</div>
        </div>
    </div>
  `,
  USDT_1: `
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="UPAY">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">UPAY</div>
            <div data-v-9e03166f="">Balance:$10 - $100k</div>
        </div>
    </div>
    <div data-v-9e03166f="" class="Recharge__content-quickInfo__item" data-channel="USDT_MANUAL">
        <div data-v-9e03166f="" class="other">
            <div data-v-9e03166f="">USDT Manual</div>
            <div data-v-9e03166f="">Balance:$10 - $100k</div>
        </div>
    </div>
  `,
};

const QUICK_MONEY_MAP = {
  INR: [210, 300, 500, 1000, 5000, 10000],
  USDT: [10, 20, 50, 100, 200, 500],
};

const alertMessage = (text) => {
  const msg = document.createElement("div");
  msg.setAttribute("data-v-1dcba851", "");
  msg.className = "message_alert_root";

  const msgContent = document.createElement("div");
  msgContent.setAttribute("data-v-1dcba851", "");
  msgContent.className = "message_alert_text";
  msgContent.style = "";
  msgContent.textContent = text;

  msg.appendChild(msgContent);
  document.body.appendChild(msg);

  setTimeout(() => {
    msgContent.classList.remove("v-enter-active", "v-enter-to");
    msgContent.classList.add("v-leave-active", "v-leave-to");

    setTimeout(() => {
      document.body.removeChild(msg);
    }, 100);
  }, 1000);
};

const renderState = (state) => {
  // payment types
  $(`.Recharge__container-tabcard__items`).removeClass("active");

  $(
    `.Recharge__container-tabcard__items[data-type="${state.paymentType}"]`,
  ).addClass("active");

  // payment channels
  $(`.rechargeTypes_list`).html(`${PAYMENT_CHANNEL_HTML[state.paymentType]}`);
  $(`.Recharge__content-quickInfo__item`).removeClass("item_active");
  $(
    `.Recharge__content-quickInfo__item[data-channel="${state.paymentChannel}"]`,
  ).addClass("item_active");

  if (state.paymentType === PAYMENT_TYPE_MAP.USDT_1) {
    $("#currency_indicator").html("$");
    $("#usdt_to_inr_inp").css("display", "block");
    $(".Recharge__content-paymoney__money-list").html(`
        ${QUICK_MONEY_MAP.USDT.map(
          (amount) => `
            <div data-v-9e03166f="" class="Recharge__content-paymoney__money-list__item" data-amount="${amount}">
                <div data-v-9e03166f="" class="amount">
                    <span data-v-9e03166f="">$</span> 
                        ${amount}
                </div>
            </div>
            `,
        ).join("")}
    `);

    $("#usdt_inr_amount").html(state.deposit_amount * USDT_INR_EXCHANGE_RATE);
  } else {
    $("#currency_indicator").html("₹");
    $("#usdt_to_inr_inp").css("display", "none");
    $(".Recharge__content-paymoney__money-list").html(`
        ${QUICK_MONEY_MAP.INR.map(
          (amount) => `
            <div data-v-9e03166f="" class="Recharge__content-paymoney__money-list__item" data-amount="${amount}">
                <div data-v-9e03166f="" class="amount">
                    <span data-v-9e03166f="">₹</span> 
                        ${amount}
                </div>
            </div>
        `,
        ).join("")}
    `);
  }

  $(`#money_amount_input`).val(state.deposit_amount);

  $(`.Recharge__content-paymoney__money-list__item`).removeClass("active");
  $(
    `.Recharge__content-paymoney__money-list__item[data-amount="${state.deposit_amount}"]`,
  ).addClass("active");

  $(".Recharge__container-tabcard__items").off("click");
  $(".Recharge__container-tabcard__items").on("click", function (e) {
    const state = getCurrentState();
    const paymentType = $(this).data("type");
    renderState({
      ...state,
      paymentType,
      paymentChannel:
        PAYMENT_CHANNEL_MAP[paymentType][
          Object.keys(PAYMENT_CHANNEL_MAP[paymentType])[0]
        ],
    });
  });

  $(".Recharge__content-quickInfo__item").off("click");
  $(".Recharge__content-quickInfo__item").on("click", function (e) {
    const state = getCurrentState();
    const paymentChannel = $(this).data("channel");
    console.log(paymentChannel);
    renderState({ ...state, paymentChannel });
  });

  $(".Recharge__content-paymoney__money-list__item").off("click");
  $(".Recharge__content-paymoney__money-list__item").on("click", function (e) {
    const state = getCurrentState();
    const deposit_amount = $(this).data("amount");
    renderState({ ...state, deposit_amount });
  });

  if (state.paymentType === PAYMENT_TYPE_MAP.USDT_1) {
    if (state.deposit_amount < MINIMUM_ALLOWED_MONEY_USDT) {
      $("#deposit_fund_btn").removeClass("rechage_active");
      return;
    } else {
      $("#deposit_fund_btn").addClass("rechage_active");
    }
  } else {
    if (state.deposit_amount < MINIMUM_ALLOWED_MONEY_INR) {
      $("#deposit_fund_btn").removeClass("rechage_active");
      return;
    } else {
      $("#deposit_fund_btn").addClass("rechage_active");
    }
  }
};

renderState(defaultState);

const getCurrentState = () => {
  const paymentType = $(".Recharge__container-tabcard__items.active").data(
    "type",
  );
  const paymentChannel = $(
    ".Recharge__content-quickInfo__item.item_active",
  ).data("channel");
  const deposit_amount = $(`#money_amount_input`).val();
  return { paymentType, paymentChannel, deposit_amount };
};

const handleNumericInput = (event) => {
  const key = event.keyCode;
  // Only allow numbers to be entered
  if (key < 48 || key > 57) {
    event.preventDefault();
  }
};

$("#money_amount_input").on("input", function (e) {
  const state = getCurrentState();

  renderState({ ...state });
});

$("#money_amount_input").on("keypress", handleNumericInput);

$("#recharge_btn").on("click", function (e) {
  const state = getCurrentState();
  alertMessage(
    `Recharge of ${state.deposit_amount} ${state.paymentType} initiated`,
  );
});

const displayBalance = async (balance) => {
  const response = await axios.get("/api/webapi/GetUserInfo");
  const userData = response?.data?.data;
  $("#money_amount_display").html(userData.money_user);
};
displayBalance();

$("#reload_money_amount_button").on("click", function (e) {
  displayBalance();
});

const handleManualRSPayPaymentRequest = async (moneyAmount) => {
  window.location.href = `/wallet/paynow/rspay?am=${moneyAmount}`;
};

const handleUPayPaymentRequest = async (moneyAmount) => {
  window.location.href = `/wallet/paynow/upay?am=${moneyAmount}`;
};

const handleManualUSDTPaymentRequest = async (moneyAmount) => {
  window.location.href = `/wallet/paynow/manual_usdt?am=${moneyAmount}`;
};

const handleManualUPIPaymentRequest = async (moneyAmount) => {
  window.location.href = `/wallet/paynow/manual_upi?am=${moneyAmount}`;
};

$("#deposit_fund_btn").on("click", function (e) {
  const state = getCurrentState();
  if (state.paymentType === PAYMENT_TYPE_MAP.USDT_1) {
    if (state.deposit_amount < MINIMUM_ALLOWED_MONEY_USDT) {
      alertMessage(`Minimum allowed money is $ ${MINIMUM_ALLOWED_MONEY_USDT}`);
      return;
    }
  } else {
    if (state.deposit_amount < MINIMUM_ALLOWED_MONEY_INR) {
      alertMessage(`Minimum allowed money is ₹ ${MINIMUM_ALLOWED_MONEY_INR}`);
      return;
    }
  }

  switch (state.paymentType) {
    case PAYMENT_TYPE_MAP.USDT_1:
      // handle USDT payment ---------------------
      switch (state.paymentChannel) {
        case PAYMENT_CHANNEL_MAP.USDT_1.UPAY:
          handleUPayPaymentRequest(state.deposit_amount);
          break;
        case PAYMENT_CHANNEL_MAP.USDT_1.USDT_MANUAL:
          handleManualUSDTPaymentRequest(state.deposit_amount);
          break;
        default:
          break;
      }
      // handle USDT payment ---------------------
      break;
    case PAYMENT_TYPE_MAP.UPI_1:
      // handle UPI 1 payment ---------------------
      handleManualRSPayPaymentRequest(state.deposit_amount);
      // handle UPI 1 payment ---------------------
      break;
    case PAYMENT_TYPE_MAP.UPI_2:
      // handle UPI 2 payment ---------------------
      handleManualUPIPaymentRequest(state.deposit_amount);
      // handle UPI 2 payment ---------------------
      break;
    default:
      break;
  }
});
