DROP TABLE IF EXISTS ChatLog;
CREATE TABLE ChatLog (
	ChatLogId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Date DATETIME NULL,
	Action VARCHAR(200),
	HostName VARCHAR(300),
	Description VARCHAR(400)
);

DROP TABLE IF EXISTS ChatMessage;
CREATE TABLE ChatMessage (
	ChatMessageId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Date DATETIME NULL,
	ChatUserId INTEGER NULL,
	Name BLOB NULL,
	Message VARCHAR(8000) NULL,
	ChatRoomId INT,
	Removed BIT
);

-- ChatUser is more of a "session" than an actual user
DROP TABLE IF EXISTS ChatUser;
CREATE TABLE ChatUser (
	ChatUserId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL, -- Id passed to participants to identify each other (public)
	Name BLOB  NULL,
	Token VARCHAR(300) NULL, -- Token passed to client in order to identify browser (private)
	UserId INTEGER NULL, -- many to one to table User which provides authentication for elevated levels
	IPAddress VARCHAR(20) NULL
);

DROP TABLE IF EXISTS User;
CREATE TABLE User (
	UserId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Login VARCHAR(20) NULL,
	Password VARCHAR(20) NULL
);

DROP TABLE IF EXISTS ChatBanList;
CREATE TABLE ChatBanList (
	ChatBanListId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	HostMask VARCHAR(300) NULL,
	Expires DATETIME NULL,
	Reason VARCHAR(8000) NULL
);

DROP TABLE IF EXISTS ChatRoom;
CREATE TABLE ChatRoom (
	ChatRoomId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Name VARCHAR(200) NULL
);

DROP TABLE IF EXISTS ChatRoomUserLevel;
CREATE TABLE ChatRoomUserLevel (
	ChatRoomUserLevelId INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	UserId VARCHAR(200) NULL,
	ChatRoomId INTEGER NULL,
	UserLevel INTEGER NULL
);

DROP VIEW IF EXISTS vChatUser;
CREATE VIEW vChatUser AS
SELECT		cu.ChatUserId,
			cu.Name,
			cu.Token,
			COALESCE(ul.UserLevel, 0) as UserLevel,
			cr.ChatRoomId
From ChatUser as cu
JOIN ChatRoom as cr
LEFT OUTER JOIN User as u on (cu.UserId = u.UserId)
LEFT OUTER JOIN	ChatRoomUserLevel as ul on (cu.UserId = ul.UserId AND cr.ChatRoomId = ul.ChatRoomId);
			
DROP VIEW IF EXISTS vChatMessages;
CREATE VIEW vChatMessages AS
SELECT 		cm.ChatMessageId,
			cu.ChatUserId,
			cr.ChatRoomId,
			cm.Date,
			cm.Name,
			cu.Token,
			COALESCE(ul.UserLevel, 0) as UserLevel,
			cm.Message,
			cm.Removed
FROM		ChatUser as cu
INNER JOIN	ChatMessage as cm on (cu.ChatUserId = cm.ChatUserId)
INNER JOIN	ChatRoom as cr on (cr.ChatRoomId = cm.ChatRoomId)
LEFT OUTER JOIN	ChatRoomUserLevel as ul on (cu.UserId = ul.UserId AND cm.ChatRoomId = ul.ChatRoomId);