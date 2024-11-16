import axios from "axios";
import connection from "../config/connectDB.js";
import e from "express";

export const GAME_CATEGORIES_MAP = {
  SLOT: 1,
  POKER: 2,
  LOBBY: 3,
  FISHING: 5,
  CASINO: 8,
};

const gameCategoriesPage = (GameCategoriesId) => async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.BYTE_FUSION_API_URL}/api/neo_jili/game_list`,
      data: {
        agentId: process.env.JILI_AGENT_ID,
        agentKey: process.env.JILI_AGENT_KEY,
        gameBaseUrl: process.env.JILI_GAME_BASE_URL,
        secretKey: process.env.BYTE_FUSION_SECRET_KEY,
      },
    });

    const slotsGame = response?.data?.gameData.find(
      (item) => item.id === GameCategoriesId,
    );

    return res.render("jili/index.ejs", {
      gameName: slotsGame.name,
      gameList: slotsGame.list,
      headerDisplay: "",
      tabAddressJili: req._parsedOriginalUrl.pathname.split("/")[2],
      tabAddressJdb: req._parsedOriginalUrl.pathname.split("/")[2],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const gameSlotsPage = (GameCategoriesId) => async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.BYTE_FUSION_API_URL}/api/neo_jili/game_list`,
      data: {
        agentId: process.env.JILI_AGENT_ID,
        agentKey: process.env.JILI_AGENT_KEY,
        gameBaseUrl: process.env.JILI_GAME_BASE_URL,
        secretKey: process.env.BYTE_FUSION_SECRET_KEY,
      },
    });

    console.log(response?.data?.gameData);

    const slotsGame = response?.data?.gameData.find(
      (item) => item.id === GameCategoriesId,
    );

    return res.render("jili/slots.ejs", {
      // gameName: slotsGame.name,
      gameList: slotsGame.list,
      // headerDisplay: "",
      // tabAddressJili: req._parsedOriginalUrl.pathname.split("/")[2],
      // tabAddressJdb: req._parsedOriginalUrl.pathname.split("/")[2],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getGameLink = async (req, res) => {
  try {
    let token = req.cookies.auth;
    let gameId = req.query.game_id;

    const [rows] = await connection.execute(
      "SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [token],
    );

    if (auth !== rows[0].token && rows[0].status !== 1) {
      return res.status(400).json({
        message: "Login is required to access this api",
        isAuthorized: false,
      });
    }

    if (!gameId) {
      return res.status(400).json({
        message: "gameID is required!",
        isAuthorized: true,
      });
    }

    console.log({
      gameId: gameId,
      agentId: process.env.JILI_AGENT_ID,
      agentKey: process.env.JILI_AGENT_KEY,
      gameBaseUrl: process.env.JILI_GAME_BASE_URL,
      token: token,
      secretKey: process.env.BYTE_FUSION_SECRET_KEY,
    });

    const response = await axios({
      method: "POST",
      url: `${process.env.BYTE_FUSION_API_URL}/api/neo_jili/generate_link`,
      data: {
        gameId: gameId,
        agentId: process.env.JILI_AGENT_ID,
        agentKey: process.env.JILI_AGENT_KEY,
        gameBaseUrl: process.env.JILI_GAME_BASE_URL,
        token: token,
        secretKey: process.env.BYTE_FUSION_SECRET_KEY,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    // return res.status(200).json({
    //    message: "Game link generated successfully!",
    //    gameLink: response?.data?.gameLink,
    //    isAuthorized: true,
    // })
    return res.redirect(response?.data?.gameLink);
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const gameList = async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.BYTE_FUSION_API_URL}/api/neo_jili/game_list`,
      data: {
        agentId: process.env.JILI_AGENT_ID,
        agentKey: process.env.JILI_AGENT_KEY,
        gameBaseUrl: process.env.JILI_GAME_BASE_URL,
        secretKey: process.env.BYTE_FUSION_SECRET_KEY,
      },
    });

    return res.status(200).json({
      gameData: response.data.gameData,
    });
  } catch (error) {
    return res
      .status(401)
      .json({ errorCode: 4, message: "Error while fetching from database!" });
  }
};

const auth = async (req, res) => {
  try {
    const { reqId, token } = req.body;
    // Check if reqId and token are provided
    if (!reqId || !token) {
      return res
        .status(400)
        .json({ errorCode: 5, message: "Request ID and token are required" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [token],
    );

    // Check if token exists in the users database
    if (rows[0]?.status == 1) {
      // Get user details from the database
      const username = rows[0]?.phone;
      const balance = rows[0]?.money;
      const token = rows[0]?.token;

      // Return the user details as the response
      return res.status(200).json({
        errorCode: 0,
        message: "Success",
        currency: "INR",
        username,
        balance,
        token,
      });
    }

    return res
      .status(401)
      .json({ errorCode: 4, message: "Token expired or invalid" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorCode: 4, message: "Error while fetching from database!" });
  }
};

const bet = async (req, res) => {
  const reqId = req.body?.reqId;
  const token = req.body?.token;
  const currency = req.body?.currency;
  const game = req.body?.game;
  const wagersTime = req.body?.wagersTime;
  const betAmount = req.body?.betAmount;
  const round = req.body?.["round(*)"];
  const winloseAmount = req.body?.winloseAmount;
  const isFreeRound = req.body?.isFreeRound;
  const userId = req.body?.userId;
  const transactionId = req.body?.transactionId;
  const platform = req.body?.platform;
  const statementType = req.body?.statementType;
  // const gameCategory = req.body?.gameCategory;
  const freeSpinData = req.body?.freeSpinData;
  const type = req.body?.type;

  // console.log("bet");
  // console.log(reqId);
  // console.log(token);
  try {
    // // console.log({
    //    reqId,
    //    token,
    //    currency,
    //    game,
    //    wagersTime,
    //    betAmount,
    //    round,
    //    winloseAmount,
    //    isFreeRound,
    //    userId,
    //    transactionId,
    //    platform,
    //    statementType,
    //    gameCategory,
    //    freeSpinData,
    // })

    console.log("Player Bet Request");
    console.log(req.body);

    // Check if reqId and token are provided
    if (!reqId || !token) {
      return res
        .status(400)
        .json({ errorCode: 4, message: "Request ID and token are required" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [token],
    );

    // Check if token exists in the users database
    if (rows[0]?.status == 1) {
      // console.log(rows[0]?.status, 1)
      // Get user details from the database
      const username = rows[0]?.phone;
      const balance = rows[0]?.money;
      const token = rows[0]?.token;

      // console.log(balance, betAmount, winloseAmount)
      if (balance < betAmount) {
        // console.log({
        //    errorCode: 2,
        //    message: "Not enough balance to bet",
        // });
        return res.status(400).json({
          errorCode: 2,
          message: "Not enough balance to bet",
        });
      }

      console.log("finalAmount", Number(balance - betAmount + winloseAmount));

      const finalAmount = Number(balance - betAmount + winloseAmount);

      await connection.query(
        "UPDATE users SET money = ?, total_money = ? WHERE `phone` = ?",
        [finalAmount, finalAmount, username],
      );

      const gameCategory = getGameTypeById(game).gameTypeId;

      await connection.query(
        "INSERT INTO jili_bets (phone, bet_amount, win_lose_amount, game_category, game_id, bet_id, bet_time, initial_balance, final_balance, status, transaction_id, time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          username,
          betAmount,
          winloseAmount,
          gameCategory,
          game,
          round,
          wagersTime,
          balance,
          finalAmount,
          1,
          transactionId,
          new Date().getTime(),
        ],
      );

      // Return the user details as the response
      return res.status(200).json({
        errorCode: 0,
        message: "success",
        username,
        currency: "INR",
        balance: finalAmount,
        txId: transactionId,
        token,
      });
    }

    return res
      .status(401)
      .json({ errorCode: 4, message: "Token expired or invalid" });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ errorCode: 4, message: "Error while fetching from database!" });
  }
};

const cancelBet = async (req, res) => {
  const reqId = req.body?.reqId;
  const token = req.body?.token;
  // const currency = req.body?.currency
  // const game = req.body?.game
  // const wagersTime = req.body?.wagersTime
  const betAmount = req.body?.betAmount;
  const round = req.body?.["round(*)"];
  const winloseAmount = req.body?.winloseAmount;
  // const userId = req.body?.userId
  // const transactionId = req.body?.transactionId
  // const platform = req.body?.platform
  // const statementType = req.body?.statementType
  // const gameCategory = req.body?.gameCategory
  // const freeSpinData = req.body?.freeSpinData
  // console.log("cancelBet");
  // console.log(reqId);
  // console.log(token);
  try {
    // // console.log({
    //    reqId,
    //    token,
    //    currency,
    //    game,
    //    wagersTime,
    //    betAmount,
    //    round,
    //    winloseAmount,
    //    isFreeRound,
    //    userId,
    //    transactionId,
    //    platform,
    //    statementType,
    //    gameCategory,
    //    freeSpinData,
    // })

    console.log("Player cancelBet Request");
    console.log(req.body);

    // Check if reqId and token are provided
    if (!reqId || !token) {
      return res.status(400).json({
        errorCode: 4,
        message: "Request ID and token are required",
      });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [token],
    );

    // console.log("cancelBet")

    // Check if token exists in the users database
    if (rows[0]?.status == 1) {
      const username = rows[0]?.phone;
      const balance = rows[0]?.money;
      const token = rows[0]?.token;

      // if (balance <= betAmount) {
      //    return res.status(400).json({
      //       errorCode: 2,
      //       message: "Bet request failed!",
      //    })
      // }
      // console.log(balance);
      // console.log(betAmount);
      // console.log(winloseAmount);
      // console.log(balance, preserve, betAmount, winloseAmount)
      console.log("finalAmount", Number(balance + betAmount - winloseAmount));

      const finalAmount = Number(balance + betAmount - winloseAmount);

      await connection.query(
        "UPDATE users SET money = ?, total_money = ? WHERE `phone` = ?",
        [finalAmount, finalAmount, username],
      );

      await connection.query(
        "UPDATE jili_bets SET status = ?, final_balance = ? WHERE `bet_id` = ?",
        [2, finalAmount, round],
      );

      // Return the user details as the response
      return res.status(200).json({
        errorCode: 0,
        message: "success",
        username,
        currency: "INR",
        balance: finalAmount,
        token,
      });
    }

    return res
      .status(401)
      .json({ errorCode: 4, message: "Token expired or invalid" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorCode: 5, message: "Error while fetching from database!" });
  }
};

const sessionBet = async (req, res) => {
  const reqId = req.body?.reqId;
  const token = req.body?.token;
  // const currency = req.body?.currency
  const game = req.body?.game;
  const wagersTime = req.body?.wagersTime;
  const betAmount = Number(req.body?.betAmount);
  const round = req.body?.round;
  const winloseAmount = Number(req.body?.winloseAmount);
  const preserve = req.body?.preserve;
  // const isFreeRound = req.body?.isFreeRound
  // const userId = req.body?.userId
  // const transactionId = req.body?.transactionId
  // const platform = req.body?.platform
  // const statementType = req.body?.statementType
  // const gameCategory = req.body?.gameCategory;
  const sessionId = req.body?.sessionId;
  // const freeSpinData = req.body?.freeSpinData
  const sessionTotalBet = req.body?.sessionTotalBet;
  const type = req.body?.type;
  // console.log("sessionBet");

  console.log("Player sessionBet Request");
  console.log(req.body);
  try {
    // // console.log({
    //    reqId,
    //    token,
    //    currency,
    //    game,
    //    wagersTime,
    //    betAmount,
    //    round,
    //    winloseAmount,
    //    isFreeRound,
    //    userId,
    //    transactionId,
    //    platform,
    //    statementType,
    //    gameCategory,
    //    freeSpinData,
    // })

    // Check if reqId and token are provided
    if (!reqId || !token) {
      return res
        .status(400)
        .json({ errorCode: 4, message: "Request ID and token are required" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [token],
    );

    console.log("sessionBet");

    // Check if token exists in the users database
    if (rows[0]?.status == 1) {
      // console.log(rows[0]?.status, 1)
      // Get user details from the database
      const username = rows[0]?.phone;
      const balance = Number(rows[0]?.money);
      const token = rows[0]?.token;

      if (balance <= betAmount) {
        return res.status(400).json({
          errorCode: 2,
          message: "Bet request failed!",
        });
      }

      console.log(balance, betAmount, winloseAmount);

      let finalAmount = 0;

      if (preserve === 0 && betAmount > 0 && winloseAmount === 0) {
        finalAmount = Number(balance - betAmount);
        console.log("finalAmount = Number(balance - betAmount);");
      } else if (preserve === 0 && betAmount === 0 && winloseAmount >= 0) {
        finalAmount = Number(balance + winloseAmount);
        console.log("finalAmount = Number(balance + winloseAmount);");
      } else if (preserve > 0 && betAmount === 0 && winloseAmount === 0) {
        finalAmount = Number(balance - preserve);
        console.log("finalAmount = Number(balance - preserve);");
      } else if (preserve > 0 && betAmount >= 0 && winloseAmount >= 0) {
        finalAmount = Number(balance + preserve - betAmount + winloseAmount);
        console.log(
          "finalAmount = Number(balance + preserve - betAmount + winloseAmount);",
        );
      }

      console.log(finalAmount);
      console.log(Number(balance + winloseAmount));

      await connection.query(
        "UPDATE users SET money = ?, total_money = ? WHERE `phone` = ?",
        [finalAmount, finalAmount, username],
      );

      if (type === 1) {
        const gameCategory = getGameTypeById(game).gameTypeId;

        await connection.query(
          "INSERT INTO jili_bets (phone, bet_amount, win_lose_amount, session_total_bet, game_category, game_id, bet_id, bet_time, initial_balance, final_balance, status, preserve, time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            username,
            betAmount,
            winloseAmount,
            sessionTotalBet,
            gameCategory,
            game,
            sessionId,
            wagersTime,
            balance,
            finalAmount,
            1,
            preserve,
            new Date().getTime(),
          ],
        );
      } else if (type === 2) {
        await connection.query(
          "UPDATE jili_bets SET win_lose_amount = ?, final_balance = ? WHERE `bet_id` = ?",
          [winloseAmount, finalAmount, sessionId],
        );
      }

      return res.status(200).json({
        errorCode: 0,
        message: "success",
        username,
        currency: "INR",
        balance: finalAmount,
        // txId: transactionId,
        token,
      });
    }
    return res
      .status(401)
      .json({ errorCode: 4, message: "Token expired or invalid" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorCode: 5, message: "Error while fetching from database!" });
  }
};

const cancelSessionBet = async (req, res) => {
  const reqId = req.body?.reqId;
  const token = req.body?.token;
  // const currency = req.body?.currency
  // const game = req.body?.game
  // const wagersTime = req.body?.wagersTime
  const betAmount = req.body?.betAmount;
  // const round = req.body?.["round(*)"]
  const winloseAmount = req.body?.winloseAmount;
  const preserve = req.body?.preserve;
  // const isFreeRound = req.body?.isFreeRound
  // const userId = req.body?.userId
  // const transactionId = req.body?.transactionId
  // const platform = req.body?.platform
  // const statementType = req.body?.statementType
  // const gameCategory = req.body?.gameCategory
  // const freeSpinData = req.body?.freeSpinData
  // console.log("cancelSessionBet");

  console.log("Player cancelSessionBet Request");
  console.log(req.body);
  try {
    // // console.log({
    //    reqId,
    //    token,
    //    currency,
    //    game,
    //    wagersTime,
    //    betAmount,
    //    round,
    //    winloseAmount,
    //    isFreeRound,
    //    userId,
    //    transactionId,
    //    platform,
    //    statementType,
    //    gameCategory,
    //    freeSpinData,
    // })

    // Check if reqId and token are provided
    if (!reqId || !token) {
      return res
        .status(400)
        .json({ errorCode: 5, message: "Request ID and token are required" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [token],
    );

    console.log("cancelSessionBet");

    // Check if token exists in the users database
    if (rows[0]?.status == 1) {
      // console.log(rows[0]?.status, 1)
      // Get user details from the database
      const username = rows[0]?.phone;
      const balance = rows[0]?.money;
      const token = rows[0]?.token;

      if (balance <= betAmount) {
        return res.status(400).json({
          message: "Bet request failed!",
        });
      }

      // // console.log(balance, betAmount, winloseAmount)

      // const finalAmount = balance + betAmount - winloseAmount

      let finalAmount;

      if (!preserve) {
        finalAmount = Number(balance + betAmount);
      } else if (preserve) {
        finalAmount = Number(balance + preserve);
      }

      console.log(finalAmount);

      await connection.query(
        "UPDATE users SET money = ?, total_money = ? WHERE `phone` = ?",
        [finalAmount, finalAmount, username],
      );

      await connection.query(
        "UPDATE jili_bets SET status = ?, final_balance = ? WHERE `bet_id` = ?",
        [2, finalAmount, round],
      );

      // Return the user details as the response
      return res.status(200).json({
        errorCode: 0,
        message: "success",
        username,
        currency: "INR",
        balance: finalAmount,
        token,
      });
    }
    return res
      .status(401)
      .json({ errorCode: 4, message: "Token expired or invalid" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorCode: 4, message: "Error while fetching from database!" });
  }
};

const jiliGamesController = {
  auth,
  bet,
  getGameLink,
  gameList,
  gameCategoriesPage,
  cancelBet,
  cancelSessionBet,
  sessionBet,
  gameSlotsPage,
};

const getGameTypeById = (gameId) => {
  let gameType = null;
  let gameTypeId = null;
  for (const gameType of gamesList) {
    for (const game of gameType.list) {
      if (game.GameId === gameId) {
        gameType = gameType.name;
        gameTypeId = gameType.id;
        break;
      }
    }

    if (gameType) {
      break;
    }
  }

  return {
    gameTypeName: gameType,
    gameTypeId,
  };
};

const gamesList = [
  {
    id: 1,
    name: "Slot",
    list: [
      {
        GameId: 2,
        name: "Chin Shi Huang",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_02.png",
      },
      {
        GameId: 4,
        name: "God Of Martial",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_04.png",
      },
      {
        GameId: 5,
        name: "Hot Chilli",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_05.png",
      },
      {
        GameId: 6,
        name: "Fortune Tree",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_06.png",
      },
      {
        GameId: 9,
        name: "War Of Dragons",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_09.png",
      },
      {
        GameId: 10,
        name: "Gem Party",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_10.png",
      },
      {
        GameId: 13,
        name: "Lucky Ball",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_13.png",
      },
      {
        GameId: 14,
        name: "Hyper Burst",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_14.png",
      },
      {
        GameId: 16,
        name: "Jungle King",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_16.png",
      },
      {
        GameId: 17,
        name: "Shanghai Beauty",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_17.png",
      },
      {
        GameId: 18,
        name: "Rock Beauty",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_18.png",
      },
      {
        GameId: 21,
        name: "Fa Fa Fa",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_21.png",
      },
      {
        GameId: 26,
        name: "Hawaii Beauty",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_26.png",
      },
      {
        GameId: 27,
        name: "SevenSevenSeven",
        GameCategoryId: 1,
        JP: true,
        Freespin: true,
        sqImageSrc: "GAMEID_27.png",
      },
      {
        GameId: 30,
        name: "Bubble Beauty",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_30.png",
      },
      {
        GameId: 33,
        name: "FortunePig",
        GameCategoryId: 1,
        JP: true,
        Freespin: true,
        sqImageSrc: "GAMEID_33.png",
      },
      {
        GameId: 35,
        name: "Crazy777",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_35.png",
      },
      {
        GameId: 36,
        name: "Bao boon chin",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_36.png",
      },
      {
        GameId: 37,
        name: "Night City",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_37.png",
      },
      {
        GameId: 38,
        name: "Fengshen",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_38.png",
      },
      {
        GameId: 40,
        name: "Crazy FaFaFa",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_40.png",
      },
      {
        GameId: 43,
        name: "XiYangYang",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_43.png",
      },
      {
        GameId: 44,
        name: "Diamond Party",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_44.png",
      },
      {
        GameId: 45,
        name: "Golden Bank",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_45.png",
      },
      {
        GameId: 46,
        name: "Dragon Treasure",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_46.png",
      },
      {
        GameId: 47,
        name: "Charge Buffalo",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_47.png",
      },
      {
        GameId: 48,
        name: "Lucky Goldbricks",
        GameCategoryId: 1,
        JP: true,
        Freespin: true,
        sqImageSrc: "GAMEID_48.png",
      },
      {
        GameId: 49,
        name: "Super Ace",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_49.png",
      },
      {
        GameId: 51,
        name: "Money Coming",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_51.png",
      },
      {
        GameId: 58,
        name: "Golden Queen",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_58.png",
      },
      {
        GameId: 61,
        name: "Dragon & Tiger",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_61.png",
      },
      {
        GameId: 62,
        name: "Dice",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_62.png",
      },
      {
        GameId: 63,
        name: "7 UP-DOWN",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_63.png",
      },
      {
        GameId: 64,
        name: "Fairness Games",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_64.png",
      },
      {
        GameId: 66,
        name: "LuckyNumber",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_66.png",
      },
      {
        GameId: 67,
        name: "Monkey Party",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_67.png",
      },
      {
        GameId: 76,
        name: "Party Night",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_76.png",
      },
      {
        GameId: 77,
        name: "Boxing King",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_77.png",
      },
      {
        GameId: 78,
        name: "Secret Treasure",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_78.png",
      },
      {
        GameId: 85,
        name: "Pharaoh Treasure",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_85.png",
      },
      {
        GameId: 87,
        name: "Book of Gold",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_87.png",
      },
      {
        GameId: 91,
        name: "Lucky Coming",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_91.png",
      },
      {
        GameId: 92,
        name: "Crazy Hunter",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_92.png",
      },
      {
        GameId: 100,
        name: "Super Rich",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_100.png",
      },
      {
        GameId: 101,
        name: "Medusa",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_101.png",
      },
      {
        GameId: 102,
        name: "Roma X",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_102.png",
      },
      {
        GameId: 103,
        name: "Golden Empire",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_103.png",
      },
      {
        GameId: 106,
        name: "TWIN WINS",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_106.png",
      },
      {
        GameId: 108,
        name: "MagicLamp",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_108.png",
      },
      {
        GameId: 109,
        name: "Fortune Gems",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_109.png",
      },
      {
        GameId: 110,
        name: "Ali Baba",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_110.png",
      },
      {
        GameId: 115,
        name: "Agent Ace",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_115.png",
      },
      {
        GameId: 116,
        name: "Happy Taxi",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_116.png",
      },
      {
        GameId: 126,
        name: "Bone Fortune",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_126.png",
      },
      {
        GameId: 130,
        name: "Thor X",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_130.png",
      },
      {
        GameId: 134,
        name: "Mega Ace",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_134.png",
      },
      {
        GameId: 135,
        name: "MAYAN EMPIRE",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_135.png",
      },
      {
        GameId: 136,
        name: "Samba",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_136.png",
      },
      {
        GameId: 137,
        name: "Gold Rush",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_137.png",
      },
      {
        GameId: 142,
        name: "Bonus Hunter",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_142.png",
      },
      {
        GameId: 144,
        name: "JILI Caishen",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_144.png",
      },
      {
        GameId: 145,
        name: "Neko Fortune",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_145.png",
      },
      {
        GameId: 146,
        name: "World Cup",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_146.png",
      },
      {
        GameId: 153,
        name: "Crazy Pusher",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_153.png",
      },
      {
        GameId: 164,
        name: "Pirate Queen",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_164.png",
      },
      {
        GameId: 166,
        name: "Wild Racer",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_166.png",
      },
      {
        GameId: 171,
        name: "Sin City",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_171.png",
      },
      {
        GameId: 172,
        name: "ELF BINGO",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_172.png",
      },
      {
        GameId: 176,
        name: "Master Tiger",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_176.png",
      },
      {
        GameId: 180,
        name: "Legacy Of Egypt",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_180.png",
      },
      {
        GameId: 181,
        name: "Wild Ace",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_181.png",
      },
      {
        GameId: 183,
        name: "Golden Joker",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_183.png",
      },
      {
        GameId: 191,
        name: "Golden Temple",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_191.png",
      },
      {
        GameId: 193,
        name: "Devil Fire",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_193.png",
      },
      {
        GameId: 198,
        name: "Sweet Land",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_198.png",
      },
      {
        GameId: 208,
        name: "Trial of Phoenix",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_208.png",
      },
      {
        GameId: 209,
        name: "Aztec Priestess",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_209.png",
      },
      {
        GameId: 214,
        name: "King Arthur",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_214.png",
      },
      {
        GameId: 223,
        name: "Fortune Gems 2",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_223.png",
      },
      {
        GameId: 225,
        name: "Cricket King 18",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_225.png",
      },
      {
        GameId: 226,
        name: "Witches' Night",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_226.png",
      },
      {
        GameId: 228,
        name: "Arena Fighter",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_228.png",
      },
      {
        GameId: 230,
        name: "Cricket SAH 75",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_230.png",
      },
      {
        GameId: 238,
        name: "Bangla Beauty",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_238.png",
      },
      {
        GameId: 239,
        name: "Dabanggg",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_239.png",
      },
      {
        GameId: 252,
        name: "Zeus",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_252.png",
      },
      {
        GameId: 258,
        name: "Devil Fire 2",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_258.png",
      },
      {
        GameId: 259,
        name: "Charge Buffalo ASCENT",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_259.png",
      },
      {
        GameId: 263,
        name: "The Pig House",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_263.png",
      },
      {
        GameId: 299,
        name: "Potion Wizard",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_299.png",
      },
      {
        GameId: 300,
        name: "Fortune Gems 3",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_300.png",
      },
      {
        GameId: 301,
        name: "Jackpot Joker",
        GameCategoryId: 1,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_301.png",
      },
      {
        GameId: 302,
        name: "Money Coming Expand Bets",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_302.png",
      },
      {
        GameId: 303,
        name: "Fortune Monkey",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_303.png",
      },
      {
        GameId: 399,
        name: "3 Coin Treasures",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_399.png",
      },
      {
        GameId: 403,
        name: "Super Ace Deluxe",
        GameCategoryId: 1,
        JP: false,
        Freespin: true,
        sqImageSrc: "GAMEID_403.png",
      },
      {
        GameId: 420,
        name: "Crazy Hunter2",
        GameCategoryId: 1,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_420.png",
      },
    ],
  },
  {
    id: 2,
    name: "Poker",
    list: [
      {
        GameId: 72,
        name: "TeenPatti",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_72.png",
      },
      {
        GameId: 75,
        name: "AK47",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_75.png",
      },
      {
        GameId: 79,
        name: "Andar Bahar",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_79.png",
      },
      {
        GameId: 94,
        name: "Rummy",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_94.png",
      },
      {
        GameId: 127,
        name: "CallBreak",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_127.png",
      },
      {
        GameId: 128,
        name: "Ludo",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_128.png",
      },
      {
        GameId: 132,
        name: "Pool Rummy",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_132.png",
      },
      {
        GameId: 159,
        name: "TeenPatti Joker",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_159.png",
      },
      {
        GameId: 160,
        name: "CallbreakQuick",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_160.png",
      },
      {
        GameId: 161,
        name: "Teenpatti 20-20",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_161.png",
      },
      {
        GameId: 163,
        name: "Ludo Quick",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_163.png",
      },
      {
        GameId: 175,
        name: "Tongits",
        GameCategoryId: 2,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_175.png",
      },
      {
        GameId: 199,
        name: "Tongits Go",
        GameCategoryId: 2,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_199.png",
      },
      {
        GameId: 210,
        name: "Poker Lobby",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_210.png",
      },
      {
        GameId: 219,
        name: "Blackjack",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_219.png",
      },
      {
        GameId: 220,
        name: "Blackjack Lucky Ladies",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_220.png",
      },
      {
        GameId: 221,
        name: "MINI FLUSH",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_221.png",
      },
      {
        GameId: 231,
        name: "Caribbean Stud Poker",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_231.png",
      },
      {
        GameId: 253,
        name: "Video Poker",
        GameCategoryId: 2,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_253.png",
      },
    ],
  },
  {
    id: 3,
    name: "Lobby",
    list: [
      {
        GameId: 80,
        name: "lobby",
        GameCategoryId: 3,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_80.png",
      },
    ],
  },
  {
    id: 5,
    name: "Fishing",
    list: [
      {
        GameId: 1,
        name: "Royal Fishing",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_01.png",
      },
      {
        GameId: 20,
        name: "Bombing Fishing",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_20.png",
      },
      {
        GameId: 32,
        name: "Jack Pot Fishing",
        GameCategoryId: 5,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_32.png",
      },
      {
        GameId: 42,
        name: "Dinosaur Tycoon",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_42.png",
      },
      {
        GameId: 60,
        name: "Dragon Fortune",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_60.png",
      },
      {
        GameId: 71,
        name: "Boom Legend",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_71.png",
      },
      {
        GameId: 74,
        name: "Mega Fishing",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_74.png",
      },
      {
        GameId: 82,
        name: "Happy Fishing",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_82.png",
      },
      {
        GameId: 119,
        name: "All-star Fishing",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_119.png",
      },
      {
        GameId: 212,
        name: "Dinosaur Tycoon II",
        GameCategoryId: 5,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_212.png",
      },
    ],
  },
  {
    id: 8,
    name: "Casino (including bingo)",
    list: [
      {
        GameId: 111,
        name: "Number King",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_111.png",
      },
      {
        GameId: 112,
        name: "Joumey West M",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_112.png",
      },
      {
        GameId: 113,
        name: "Poker King",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_113.png",
      },
      {
        GameId: 114,
        name: "European Roulette",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_114.png",
      },
      {
        GameId: 118,
        name: "Big Small",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_118.png",
      },
      {
        GameId: 122,
        name: "iRich Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_122.png",
      },
      {
        GameId: 123,
        name: "Dragon & Tiger",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_123.png",
      },
      {
        GameId: 124,
        name: "7 UP 7 DOWN",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_124.png",
      },
      {
        GameId: 125,
        name: "Sic Bo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_125.png",
      },
      {
        GameId: 139,
        name: "Fortune Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_139.png",
      },
      {
        GameId: 143,
        name: "Bonus Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_143.png",
      },
      {
        GameId: 147,
        name: "Bingo Empire",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_147.png",
      },
      {
        GameId: 148,
        name: "Bingo Carnaval",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_148.png",
      },
      {
        GameId: 149,
        name: "Calaca Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_149.png",
      },
      {
        GameId: 150,
        name: "Lucky Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_150.png",
      },
      {
        GameId: 151,
        name: "Super Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_151.png",
      },
      {
        GameId: 152,
        name: "Baccarat",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_152.png",
      },
      {
        GameId: 173,
        name: "West Hunter Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_173.png",
      },
      {
        GameId: 174,
        name: "Jackpot Bingo",
        GameCategoryId: 8,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_174.png",
      },
      {
        GameId: 177,
        name: "Bingo Adventure",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_177.png",
      },
      {
        GameId: 178,
        name: "Go Goal Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_178.png",
      },
      {
        GameId: 179,
        name: "Win Drop",
        GameCategoryId: 8,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_179.png",
      },
      {
        GameId: 182,
        name: "Golden Land",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_182.png",
      },
      {
        GameId: 195,
        name: "Pearls of Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_195.png",
      },
      {
        GameId: 197,
        name: "Color Game",
        GameCategoryId: 8,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_197.png",
      },
      {
        GameId: 200,
        name: "Pappu",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_200.png",
      },
      {
        GameId: 204,
        name: "Color Prediction",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_204.png",
      },
      {
        GameId: 216,
        name: "Candyland Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_216.png",
      },
      {
        GameId: 217,
        name: "Magic Lamp Bingo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_217.png",
      },
      {
        GameId: 224,
        name: "Go Rush",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_224.png",
      },
      {
        GameId: 229,
        name: "Mines",
        GameCategoryId: 8,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_229.png",
      },
      {
        GameId: 232,
        name: "Tower",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_232.png",
      },
      {
        GameId: 233,
        name: "HILO",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_233.png",
      },
      {
        GameId: 235,
        name: "Limbo",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_235.png",
      },
      {
        GameId: 236,
        name: "Wheel",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_236.png",
      },
      {
        GameId: 241,
        name: "Keno",
        GameCategoryId: 8,
        JP: true,
        Freespin: false,
        sqImageSrc: "GAMEID_241.png",
      },
      {
        GameId: 242,
        name: "Plinko",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_242.png",
      },
      {
        GameId: 254,
        name: "Mines Gold",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_254.png",
      },
      {
        GameId: 261,
        name: "Crash Bonus",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_261.png",
      },
      {
        GameId: 262,
        name: "Speed Baccarat",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_262.png",
      },
      {
        GameId: 297,
        name: "Jogo Do Bicho",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_297.png",
      },
      {
        GameId: 389,
        name: "Fish Prawn Crab",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_389.png",
      },
      {
        GameId: 407,
        name: "Crash Goal",
        GameCategoryId: 8,
        JP: false,
        Freespin: false,
        sqImageSrc: "GAMEID_407.png",
      },
    ],
  },
];

export default jiliGamesController;
