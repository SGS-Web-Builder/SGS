import moment from "moment";
import connection from "../config/connectDB.js";

const gameStatisticsPage = async (req, res) => {
  return res.render("member/game_statistics.ejs");
};

const gameStatistics = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let type = req.query.type;

    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    const userInfo = user[0];

    let startDate = 0;
    let endDate = 0;
    if (type === "today") {
      startDate = new Date().setHours(0, 0, 0, 0);
      endDate = new Date().setHours(23, 59, 59, 999);
    } else if (type === "yesterday") {
      startDate = new Date(
        new Date().setDate(new Date().getDate() - 1),
      ).setHours(0, 0, 0, 0);
      endDate = new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
        23,
        59,
        59,
        999,
      );
    } else if (type === "week") {
      startDate = new Date(
        new Date().setDate(new Date().getDate() - 7),
      ).setHours(0, 0, 0, 0);
      endDate = new Date().setHours(23, 59, 59, 999);
    } else if (type === "month") {
      startDate = new Date(
        new Date().setDate(new Date().getDate() - 30),
      ).setHours(0, 0, 0, 0);
      endDate = new Date().setHours(23, 59, 59, 999);
    } else if (type === "all") {
      startDate = 0;
      endDate = new Date().setHours(23, 59, 59, 999);
    }

    const [wingo1] = await connection.query(
      "SELECT COUNT(*) AS wingoBetCount FROM minutes_1 WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const wingoBetCount = parseInt(wingo1[0].wingoBetCount || 0);
    const [k31] = await connection.query(
      "SELECT COUNT(*) AS k3BetCount FROM result_k3 WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const k3BetCount = parseInt(k31[0].k3BetCount || 0);
    const [G5d1] = await connection.query(
      "SELECT COUNT(*) AS g5dBetCount FROM result_5d WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const g5dBetCount = parseInt(G5d1[0].g5dBetCount || 0);
    const [trxWingo1] = await connection.query(
      "SELECT COUNT(*) AS trxWingoBetCount FROM trx_wingo_bets WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const trxWingoBetCount = parseInt(trxWingo1[0].trxWingoBetCount || 0);

    const [wingo2] = await connection.query(
      "SELECT SUM(money) AS wingoBetAmount FROM minutes_1 WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const wingoBetAmount = parseInt(wingo2[0].wingoBetAmount || 0);
    const [k32] = await connection.query(
      "SELECT SUM(money) AS k3BetAmount FROM result_k3 WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const k3BetAmount = parseInt(k32[0].k3BetAmount || 0);
    const [G5d2] = await connection.query(
      "SELECT SUM(money) AS g5dBetAmount FROM result_5d WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const g5dBetAmount = parseInt(G5d2[0].g5dBetAmount || 0);
    const [trxWingo2] = await connection.query(
      "SELECT SUM(money) AS trxWingoBetAmount FROM trx_wingo_bets WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const trxWingoBetAmount = parseInt(trxWingo2[0].trxWingoBetAmount || 0);

    const [wingo3] = await connection.query(
      "SELECT SUM(get) AS wingoWinAmount FROM minutes_1 WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const wingoWinAmount = parseInt(wingo3[0].wingoWinAmount || 0);
    const [k33] = await connection.query(
      "SELECT SUM(get) AS k3WinAmount FROM result_k3 WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const k3WinAmount = parseInt(k33[0].k3WinAmount || 0);
    const [G5d3] = await connection.query(
      "SELECT SUM(get) AS g5dWinAmount FROM result_5d WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const g5dWinAmount = parseInt(G5d3[0].g5dWinAmount || 0);
    const [trxWingo3] = await connection.query(
      "SELECT SUM(get) AS trxWingoWinAmount FROM trx_wingo_bets WHERE phone = ? AND time BETWEEN '?' AND '?'",
      [userInfo.phone, startDate, endDate],
    );
    const trxWingoWinAmount = parseInt(trxWingo3[0].trxWingoWinAmount || 0);

    const totalBetCount =
      wingoBetCount + k3BetCount + g5dBetCount + trxWingoBetCount;
    const totalBetAmount =
      wingoBetAmount + k3BetAmount + g5dBetAmount + trxWingoBetAmount;
    const totalWinAmount =
      wingoWinAmount + k3WinAmount + g5dWinAmount + trxWingoWinAmount;

    return res.status(200).send({
      status: 200,
      totalBetAmount: totalBetAmount,
      list: [
        {
          title: "lottery",
          totalBetAmount: totalBetAmount,
          numberOfBets: totalBetCount,
          totalWinAmount: totalWinAmount,
        },
      ],
      message: "Game statistics fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: 500,
      message: "Something went wrong! Please try again later.",
    });
  }
};

const autoCleanOldGames = async () => {
  try {
    const TwoDayAgoUnixMoment = moment().subtract(2, "days").valueOf();

    await connection.execute(
      `DELETE FROM wingo WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
    await connection.execute(
      `DELETE FROM 5d WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
    await connection.execute(
      `DELETE FROM k3 WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
    await connection.execute(
      `DELETE FROM trx_wingo_game WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
  } catch (error) {
    console.log(error);
    console.log("Failed to delete old games table!");
  }
};

const GAME_TYPE_MAP = {
  Lottery: "Lottery",
  Casino: "Casino",
  Fishing: "Fishing",
  Rummy: "Rummy",
  Original: "Original",
  Slots: "Slots",
};

const GAME_MAP = {
  WinGo: "Win Go",
  TrxWinGo: "Trx Win Go",
  D5: "5D",
  K3: "K3",
  JILI: "JILI",
  JDB: "JDB",
};

const betHistory = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    const game_type = req.query.game_type;
    const game = req.query.game;
    const startDate =
      req.query.date && req.query.date !== "Invalid date"
        ? moment(req.query.date, "DD-MM-YYYY").startOf("day").valueOf()
        : moment().startOf("day").valueOf();

    const endDate =
      req.query.date && req.query.date !== "Invalid date"
        ? moment(req.query.date, "DD-MM-YYYY")
            .startOf("day")
            .add(1, "day")
            .valueOf()
        : moment().startOf("day").add(1, "day").valueOf();

    const [user] = await connection.query(
      "SELECT `phone` FROM users WHERE `token` = ? ",
      [auth],
    );

    const phone = user[0].phone;

    console.log(game_type, game, startDate, endDate, phone);
    if (GAME_TYPE_MAP.Lottery === game_type) {
      if (GAME_MAP.WinGo === game) {
        const [bets] = await connection.query(
          "SELECT * FROM minutes_1 WHERE phone = ? AND time >= ? AND time <= ?",
          [phone, startDate, endDate],
        );

        const WingoType = {
          wingo: "Wingo 1Min",
          wingo3: "Wingo 3Min",
          wingo5: "Wingo 5Min",
          wingo10: "Wingo 10Min",
        };

        const WingoSelect = {
          0: "0",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          l: "Big",
          n: "Small",
          x: "Green",
          t: "Violet",
          d: "Red",
        };

        const list = bets.map((bet) => {
          return {
            game: "Win Go",
            winLoss: bet.get === 0 ? "Loss" : "Win",
            type: WingoType[bet.game],
            period: bet.stage,
            orderNumber: bet.id_product,
            select: WingoSelect[bet.bet],
            betAmount: Number(bet.money + bet.fee),
            actualBetAmount: bet.money,
            fee: bet.fee,
            winAmount: bet.get,
            profitLoss:
              bet.get === 0
                ? `-₹${Number(bet.money + bet.fee)}`
                : `₹${bet.get - bet.money}`,
            result: {
              number: bet.result,
              bs: bet.result > 4 ? "Big" : "Small",
              color:
                Number(bet.result) === 0
                  ? "Red Violet"
                  : Number(bet.result) === 5
                    ? "Green Violet"
                    : Number(bet.result) % 2 === 0
                      ? "Red"
                      : "Green",
            },
            time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
          };
        });
        return res.status(200).send({
          status: 200,
          bets: list,
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.K3 === game) {
        const [bets] = await connection.query(
          "SELECT * FROM result_k3 WHERE phone = ? AND time >= ? AND time <= ?",
          [phone, startDate, endDate],
        );
        return res.status(200).send({
          status: 200,
          bets: bets,
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.D5 === game) {
        const [bets] = await connection.query(
          "SELECT * FROM result_5d WHERE phone = ? AND time >= ? AND time <= ?",
          [phone, startDate, endDate],
        );
        return res.status(200).send({
          status: 200,
          bets: bets,
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.TrxWinGo === game) {
        const [bets] = await connection.query(
          "SELECT * FROM trx_wingo_bets WHERE phone = ? AND time >= ? AND time <= ?",
          [phone, startDate, endDate],
        );

        const TrxWingoType = {
          trx_wingo: "Trx Wingo 1Min",
          trx_wingo3: "Trx Wingo 3Min",
          trx_wingo5: "Trx Wingo 5Min",
          trx_wingo10: "Trx Wingo 10Min",
        };

        const TrxWingoSelect = {
          0: "0",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          l: "Big",
          n: "Small",
          x: "Green",
          t: "Violet",
          d: "Red",
        };

        const list = bets.map((bet) => {
          return {
            game: "Trx Win Go",
            winLoss: bet.get === 0 ? "Loss" : "Win",
            type: TrxWingoType[bet.game],
            period: bet.stage,
            orderNumber: bet.id_product,
            select: TrxWingoSelect[bet.bet],
            betAmount: Number(bet.money + bet.fee),
            actualBetAmount: bet.money,
            fee: bet.fee,
            winAmount: bet.get,
            profitLoss:
              bet.get === 0
                ? `-₹${Number(bet.money + bet.fee)}`
                : `₹${bet.get - bet.money}`,
            result: {
              number: bet.result,
              bs: bet.result > 4 ? "Big" : "Small",
              color:
                Number(bet.result) === 0
                  ? "Red Violet"
                  : Number(bet.result) === 5
                    ? "Green Violet"
                    : Number(bet.result) % 2 === 0
                      ? "Red"
                      : "Green",
            },
            time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
          };
        });
        return res.status(200).send({
          status: 200,
          bets: list,
          message: "Bets fetched successfully",
        });
      }
    } else if (GAME_TYPE_MAP.Casino === game_type) {
      if (GAME_MAP.JILI === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jili_bets WHERE phone = ? AND time >= ? AND time <= ? AND game_category = ?",
          [phone, startDate, endDate, 8],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JILI",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.game_id,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_loss_amount,
              profitLoss:
                bet.win_loss_amount === 0
                  ? `-₹${bet.bet_amount}`
                  : `₹${bet.win_loss_amount}`,
            };
          }),
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.JDB === game) {
        // const [bets] = await connection.query(
        //   "SELECT * FROM jdb_bets WHERE phone = ? AND time >= ? AND time <= ?",
        //   [phone, date],
        // );
        return res.status(200).send({
          status: 200,
          bets: [],
          message: "Bets fetched successfully",
        });
      }
    } else if (GAME_TYPE_MAP.Fishing === game_type) {
      if (GAME_MAP.JILI === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jili_bets WHERE phone = ? AND time >= ? AND time <= ? AND game_category = ?",
          [phone, startDate, endDate, 5],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JILI",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.game_id,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_loss_amount,
              profitLoss:
                bet.win_loss_amount === 0
                  ? `-₹${bet.bet_amount}`
                  : `₹${bet.win_loss_amount}`,
            };
          }),
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.JDB === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jdb_bets WHERE phone = ? AND time >= ? AND time <= ? AND gType = ?",
          [phone, startDate, endDate, 7],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JDB",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.gType,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_amount,
              profitLoss: bet.net_win_amount,
            };
          }),
          message: "Bets fetched successfully",
        });
      }
    } else if (GAME_TYPE_MAP.Rummy === game_type) {
      if (GAME_MAP.JILI === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jili_bets WHERE phone = ? AND time >= ? AND time <= ? AND game_category = ?",
          [phone, startDate, endDate, 2],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JILI",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.game_id,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_loss_amount,
              profitLoss:
                bet.win_loss_amount === 0
                  ? `-₹${bet.bet_amount}`
                  : `₹${bet.win_loss_amount}`,
            };
          }),
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.JDB === game) {
        // const [bets] = await connection.query(
        //   "SELECT * FROM jdb_bets WHERE phone = ? AND time >= ? AND time <= ?",
        //   [phone, startDate, endDate],
        // );
        return res.status(200).send({
          status: 200,
          bets: [],
          message: "Bets fetched successfully",
        });
      }
    } else if (GAME_TYPE_MAP.Original === game_type) {
      if (GAME_MAP.JILI === game) {
        // const [bets] = await connection.query(
        //   "SELECT * FROM jili_bets WHERE phone = ? AND time >= ? AND time <= ?",
        //   [phone, date],
        // );
        return res.status(200).send({
          status: 200,
          bets: [],
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.JDB === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jdb_bets WHERE phone = ? AND time >= ? AND time <= ? AND gType = ?",
          [phone, startDate, endDate, 22],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JDB",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.gType,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_amount,
              profitLoss: bet.net_win_amount,
            };
          }),
          message: "Bets fetched successfully",
        });
      }
    } else if (GAME_TYPE_MAP.Slots === game_type) {
      if (GAME_MAP.JILI === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jili_bets WHERE phone = ? AND time >= ? AND time <= ? AND game_category = ?",
          [phone, startDate, endDate, 1],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JILI",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.game_id,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_loss_amount,
              profitLoss:
                bet.win_loss_amount === 0
                  ? `-₹${bet.bet_amount}`
                  : `₹${bet.win_loss_amount}`,
            };
          }),
          message: "Bets fetched successfully",
        });
      } else if (GAME_MAP.JDB === game) {
        const [bets] = await connection.query(
          "SELECT * FROM jdb_bets WHERE phone = ? AND time >= ? AND time <= ? AND gType = ?",
          [phone, startDate, endDate, 0],
        );
        return res.status(200).send({
          status: 200,
          bets: bets.map((bet) => {
            return {
              game: "JDB",
              time: moment(Number(bet.time)).format("DD-MM-YYYY HH:mm:ss"),
              type: bet.gType,
              orderNumber: bet.bet_id,
              betAmount: bet.bet_amount,
              winningsAmount: bet.win_amount,
              profitLoss: bet.net_win_amount,
            };
          }),
          message: "Bets fetched successfully",
        });
      }
    }

    return res.status(200).send({
      status: 400,
      message: "Bets fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: 500,
      message: "Something went wrong! Please try again later.",
    });
  }
};

const gameController = {
  gameStatistics,
  gameStatisticsPage,
  autoCleanOldGames,
  betHistory,
};

export default gameController;
