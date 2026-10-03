-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 18, 2026 at 07:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistema_ideas`
--

-- --------------------------------------------------------

--
-- Table structure for table `contributions`
--

CREATE TABLE `contributions` (
  `id` int(11) NOT NULL,
  `item_type` enum('proposal','problem','match') NOT NULL,
  `item_id` int(11) NOT NULL,
  `user_session` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `contribution_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contributions`
--

INSERT INTO `contributions` (`id`, `item_type`, `item_id`, `user_session`, `username`, `contribution_text`, `created_at`) VALUES
(2, 'proposal', 65, 'session_1764815239722_od5j38b2u', 'Javiru', 'Que guay ya si va', '2025-12-04 02:27:32'),
(3, 'problem', 25, 'session_1764815239722_od5j38b2u', 'Javiru', 'Si opino igual', '2025-12-04 02:27:54'),
(4, 'proposal', 61, 'session_1764815520409_ak4ok92sz', 'Javiru', 'hrey', '2025-12-04 02:32:14'),
(5, 'problem', 25, 'session_1764815770129_rggrpbfwr', 'Javiru', 'javi', '2025-12-04 02:37:09'),
(11, 'match', 15, 'session_1764815977013_7yk7d1l3w', 'Javiru', 'aportación', '2025-12-04 02:40:37'),
(13, 'proposal', 58, 'session_1764865615925_t8fetdb15', 'Javiru', 'hola que pasa', '2025-12-04 16:36:22'),
(14, 'proposal', 70, 'session_1764869023_6931c39f3cdd19.86385327', 'Pablo Larios', 'hola', '2025-12-04 17:23:57'),
(15, 'proposal', 70, 'session_1764872017_6931cf5140ade4.27754972', 'Javier Rueda', 'hola que tal', '2025-12-04 18:13:46');

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `moderator_session` varchar(100) NOT NULL,
  `moderator_username` varchar(50) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','published') NOT NULL DEFAULT 'published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`id`, `problem_id`, `proposal_id`, `moderator_session`, `moderator_username`, `notes`, `created_at`, `status`) VALUES
(11, 13, 52, 'session_1764379418087_bj8scv0jf', 'Admintest', '', '2025-11-29 01:32:35', 'published'),
(12, 17, 57, 'session_1764388924598_7qc0ivmvv', 'Javiru', '', '2025-11-29 04:11:46', 'published'),
(14, 24, 57, 'session_1764809122204_ltnao30j9', 'Admintest', 'viva la vida', '2025-12-04 00:46:10', 'published'),
(15, 26, 60, 'session_1764815520409_ak4ok92sz', 'Javiru', 'fdg', '2025-12-04 02:32:40', 'published'),
(16, 15, 57, 'session_1764869023_6931c39f3cdd19.86385327', 'Pablo Larios', '', '2025-12-04 17:24:16', 'published'),
(17, 30, 72, 'session_1764881580_6931f4ac873e20.98772066', 'Javier Rueda', '', '2025-12-04 20:56:51', 'published'),
(18, 17, 54, 'session_1765917351_6941c2a7bc1505.47022835', 'Javier Rueda', '', '2025-12-16 20:54:34', 'published'),
(19, 23, 69, 'session_1768757454_696d18ce33a901.06391806', 'Javier Rueda', 'clsdfasn.kfna', '2026-01-18 17:31:33', 'published');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `color` varchar(50) NOT NULL,
  `session` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `problems`
--

CREATE TABLE `problems` (
  `id` int(11) NOT NULL,
  `user_session` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('ET Actividades','ET ACTIVIDADES','ET COMU','ET Impacto Social','ET IMPACTO SOCIAL','GAP','GAvi','GAVI','GAS','GAT','GAEM','GA WeB','Network Squad','GT proofreading') NOT NULL,
  `color` varchar(50) NOT NULL,
  `support_count` int(11) DEFAULT 1,
  `is_locked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `slack_url` varchar(500) DEFAULT NULL,
  `attachments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `problems`
--

INSERT INTO `problems` (`id`, `user_session`, `username`, `title`, `description`, `category`, `color`, `support_count`, `is_locked`, `created_at`, `slack_url`, `attachments`) VALUES
(13, 'session_1764379418087_bj8scv0jf', 'Admintest', 'ET actividades', '', 'ET Actividades', '#3B82F6', 1, 0, '2025-11-29 01:31:44', NULL, NULL),
(14, 'session_1764379418087_bj8scv0jf', 'Admintest', 'ET COMU', '', 'ET COMU', '#EC4899', 1, 0, '2025-11-29 01:33:29', NULL, NULL),
(15, 'session_1764379418087_bj8scv0jf', 'Admintest', 'ET IMPACTO SOCIAL', '', 'ET Impacto Social', '#10B981', 1, 0, '2025-11-29 01:33:55', NULL, NULL),
(17, 'session_1764379418087_bj8scv0jf', 'Admintest', 'GAvi', '', 'GAvi', '#8B5CF6', 1, 0, '2025-11-29 01:34:15', NULL, NULL),
(19, 'session_1764379418087_bj8scv0jf', 'Admintest', 'GAS', '', 'GAS', '#EF4444', 1, 0, '2025-11-29 01:34:30', NULL, NULL),
(23, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'network squad', '', 'Network Squad', '#F97316', 1, 0, '2025-11-29 03:12:24', NULL, NULL),
(24, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'gt proofreading', '', 'GT proofreading', '#84CC16', 1, 0, '2025-11-29 03:12:40', NULL, NULL),
(25, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'Gap', '', 'GAP', '#F59E0B', 3, 0, '2025-11-29 03:12:56', NULL, NULL),
(26, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'GAT', '', 'GAT', '#06B6D4', 1, 0, '2025-11-29 03:13:14', NULL, NULL),
(27, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'GAEM', '', 'GAEM', '#14B8A6', 1, 0, '2025-11-29 03:13:30', NULL, NULL),
(30, 'session_1764865353993_89oxo8k9h', 'Javiru', 'todo lo que hay en fi me lo roba el internationalhub', '', 'GAT', '#06B6D4', 1, 0, '2025-12-04 16:23:30', '', '[]'),
(31, 'session_1767292748_6956bf4ca06aa1.80416856', 'Javier Rueda', 'hola amin', '', 'GAvi', '#8B5CF6', 1, 0, '2026-01-01 18:39:42', '', '[]');

-- --------------------------------------------------------

--
-- Table structure for table `problem_supporters`
--

CREATE TABLE `problem_supporters` (
  `id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `user_session` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `problem_supporters`
--

INSERT INTO `problem_supporters` (`id`, `problem_id`, `user_session`, `username`, `created_at`) VALUES
(42, 13, 'session_1764379418087_bj8scv0jf', 'Admintest', '2025-11-29 01:31:44'),
(43, 14, 'session_1764379418087_bj8scv0jf', 'Admintest', '2025-11-29 01:33:29'),
(44, 15, 'session_1764379418087_bj8scv0jf', 'Admintest', '2025-11-29 01:33:55'),
(46, 17, 'session_1764379418087_bj8scv0jf', 'Admintest', '2025-11-29 01:34:15'),
(48, 19, 'session_1764379418087_bj8scv0jf', 'Admintest', '2025-11-29 01:34:30'),
(52, 23, 'session_1764385823606_0d8uwhlvx', 'Admintest', '2025-11-29 03:12:24'),
(53, 24, 'session_1764385823606_0d8uwhlvx', 'Admintest', '2025-11-29 03:12:40'),
(54, 25, 'session_1764385823606_0d8uwhlvx', 'Admintest', '2025-11-29 03:12:56'),
(55, 26, 'session_1764385823606_0d8uwhlvx', 'Admintest', '2025-11-29 03:13:14'),
(56, 27, 'session_1764385823606_0d8uwhlvx', 'Admintest', '2025-11-29 03:13:30'),
(58, 25, 'session_1764815239722_od5j38b2u', 'Javiru', '2025-12-04 02:28:09'),
(60, 30, 'session_1764865353993_89oxo8k9h', 'Javiru', '2025-12-04 16:23:30'),
(63, 25, 'session_1765917351_6941c2a7bc1505.47022835', 'Javier Rueda', '2025-12-16 20:55:30'),
(64, 31, 'session_1767292748_6956bf4ca06aa1.80416856', 'Javier Rueda', '2026-01-01 18:39:42');

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE `proposals` (
  `id` int(11) NOT NULL,
  `user_session` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `slack_url` varchar(500) DEFAULT NULL COMMENT 'Enlace a conversación de Slack',
  `category` enum('ET Actividades','ET ACTIVIDADES','ET COMU','ET Impacto Social','ET IMPACTO SOCIAL','GAP','GAvi','GAVI','GAS','GAT','GAEM','GA WeB','Network Squad','GT proofreading') NOT NULL,
  `color` varchar(50) NOT NULL,
  `is_highlighted` tinyint(1) DEFAULT 0,
  `is_locked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `attachments` text DEFAULT NULL COMMENT 'JSON array de objetos {url, name, type}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `proposals`
--

INSERT INTO `proposals` (`id`, `user_session`, `username`, `title`, `description`, `slack_url`, `category`, `color`, `is_highlighted`, `is_locked`, `created_at`, `attachments`) VALUES
(46, 'session_1764379418087_bj8scv0jf', 'Admintest', 'Gavi', 'hola', 'https://media.istockphoto.com/id/533995902/es/foto/ping%C3%BCino-gent%C3%BA-caminar-en-la-nieve-en-la-ant%C3%A1rtida.jpg?s=612x612&w=0&k=20&c=7W1L1NnNuzKQWtqyEnBUPRVmJ9y76G3waPHM6yMp51w=', 'GAvi', '#8B5CF6', 0, 0, '2025-11-29 01:27:25', NULL),
(47, 'session_1764379418087_bj8scv0jf', 'Admintest', 'GAS', '', '', 'GAS', '#EF4444', 0, 0, '2025-11-29 01:27:55', NULL),
(52, 'session_1764379418087_bj8scv0jf', 'Admintest', 'ET Actividades', '', '', 'ET Actividades', '#3B82F6', 0, 0, '2025-11-29 01:29:18', NULL),
(53, 'session_1764379418087_bj8scv0jf', 'Admintest', 'ET COMU', '', '', 'ET COMU', '#EC4899', 0, 0, '2025-11-29 01:29:27', NULL),
(54, 'session_1764379418087_bj8scv0jf', 'Admintest', 'ET Impacto Social', '', '', 'ET Impacto Social', '#10B981', 0, 0, '2025-11-29 01:29:40', NULL),
(57, 'session_1764385719256_p8s44t6uz', 'Javiru', 'GT proofreading', '', '', 'GT proofreading', '#84CC16', 0, 0, '2025-11-29 03:08:53', NULL),
(58, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'GAEM', '', '', 'GAEM', '#14B8A6', 0, 0, '2025-11-29 03:10:49', NULL),
(59, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'NetworkSquad', '', '', 'Network Squad', '#F97316', 0, 0, '2025-11-29 03:11:15', NULL),
(60, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'GAT', '', '', 'GAT', '#06B6D4', 0, 0, '2025-11-29 03:11:33', NULL),
(61, 'session_1764385823606_0d8uwhlvx', 'Admintest', 'GAP', '', '', 'GAP', '#F59E0B', 0, 0, '2025-11-29 03:11:50', NULL),
(65, 'session_1764811915636_1uyg6azr1', 'Javiru', 'hhh', 'aaa', 'https://esn-malaga.slack.com/archives/G01247XS42K/p1763853936688939?thread_ts=1763494908.320469&cid=G01247XS42K', 'GT proofreading', '#84CC16', 0, 0, '2025-12-04 01:32:48', '[{\"url\":\"https://images.unsplash.com/photo-1689308271305-58e75832289b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D\",\"name\":\"Hola\",\"type\":\"document\"}]'),
(68, 'session_1764864714040_z7gs772kl', 'Javiru', 'hhh', '', '', 'GAEM', '#14B8A6', 0, 0, '2025-12-04 16:12:10', '[]'),
(69, 'session_1764865330089_7x0hrsmr1', 'Javiru', 'hola', '', '', 'GAT', '#06B6D4', 0, 0, '2025-12-04 16:22:22', '[]'),
(70, 'session_1764865353993_89oxo8k9h', 'Javiru', 'hola', '', '', 'ET Impacto Social', '#10B981', 0, 0, '2025-12-04 16:24:03', '[]'),
(71, 'session_1764881580_6931f4ac873e20.98772066', 'Javier Rueda', 'Hackathon webjigsaw', 'jrgqwkegrkqewgkrgbqewuk', '', 'GAvi', '#8B5CF6', 0, 0, '2025-12-04 20:53:56', '[]'),
(72, 'session_1764881580_6931f4ac873e20.98772066', 'Javier Rueda', 'caja fuerte en ofi', '', '', 'GAS', '#EF4444', 0, 0, '2025-12-04 20:56:32', '[]'),
(74, 'session_1765917351_6941c2a7bc1505.47022835', 'Javier Rueda', 'Ga web', '', '', 'GA WeB', '#A855F7', 0, 0, '2025-12-16 20:41:42', '[]'),
(76, 'session_1766524797_694b077dd80042.91603835', 'Javier Rueda', 'Caja fuerte en  oficina teatinos', 'wernnoiwehilrnqewlnrqweilr', '', 'GAS', '#EF4444', 0, 0, '2025-12-23 21:20:38', '[]');

-- --------------------------------------------------------

--
-- Table structure for table `proposal_support`
--

CREATE TABLE `proposal_support` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `user_session` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposal_support`
--

INSERT INTO `proposal_support` (`id`, `proposal_id`, `user_session`, `username`, `created_at`) VALUES
(1, 61, 'session_1764521244679_ah0h3emwf', 'Javiru', '2025-11-30 16:50:31'),
(3, 70, 'session_1764881580_6931f4ac873e20.98772066', 'Javier Rueda', '2025-12-04 20:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `session` varchar(100) NOT NULL,
  `role` enum('user','moderator') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'Hash bcrypt de contraseña (NULL para usuarios de Google)',
  `login_method` enum('manual','google') DEFAULT 'manual' COMMENT 'Método de autenticación usado',
  `google_id` varchar(255) DEFAULT NULL COMMENT 'ID único de Google OAuth',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email del usuario',
  `picture` varchar(500) DEFAULT NULL COMMENT 'URL de foto de perfil (Google)',
  `last_login` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Último login'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `session`, `role`, `created_at`, `password_hash`, `login_method`, `google_id`, `email`, `picture`, `last_login`) VALUES
(6, 'AdminTest', 'user_1763925931076_v8evte5b3', 'moderator', '2025-11-23 19:25:31', 'Viewer25¿', 'manual', NULL, NULL, NULL, '2025-12-04 18:15:34'),
(12, 'TestUserTestUser', 'user_1763926460761_725u39t06', 'user', '2025-11-23 19:34:20', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(14, 'TestUser', 'user_1763934815877_q1yescf3p', 'user', '2025-11-23 21:53:35', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(18, 'TestUser2', 'user_1763935021305_jcju3z58a', 'user', '2025-11-23 21:57:01', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(19, 'RegularUser', 'user_1763935173154_fr932thb0', 'user', '2025-11-23 21:59:33', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(24, 'TestUserFinal', 'user_1763937407423_uat68gqmw', 'user', '2025-11-23 22:36:47', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(27, 'DeleteTestUser', 'user_1763937679689_ng9p6ap4h', 'user', '2025-11-23 22:41:19', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(29, 'StructureTest', 'user_1763938362195_5qp31x1jn', 'user', '2025-11-23 22:52:42', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(32, 'Javiru', 'user_1763938885891_e7mj15k0c', 'user', '2025-11-23 23:01:25', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(34, 'DebugUser', 'user_1763939240783_pnsvece3x', 'user', '2025-11-23 23:07:20', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(38, 'FinalTest', 'user_1763939760163_ldnrq33na', 'user', '2025-11-23 23:16:00', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(42, 'UserTest', 'user_1763940119822_6ya11yqa8', 'user', '2025-11-23 23:21:59', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(52, 'DeleteButtonTest', 'user_1763940992713_gn163tzhy', 'user', '2025-11-23 23:36:32', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(58, 'ClickTest', 'user_1763942106461_o72cey74k', 'user', '2025-11-23 23:55:06', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(59, 'FinalVerify', 'user_1763942318990_8sugx9yvq', 'user', '2025-11-23 23:58:38', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(62, 'FinalTest2', 'user_1763942848481_0s431ixt9', 'user', '2025-11-24 00:07:28', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(64, 'javi', 'user_1763943242131_is18r1kbz', 'user', '2025-11-24 00:14:02', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(66, 'ReviewTest', 'user_1764042411536_568olst86', 'user', '2025-11-25 03:46:51', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(68, 'TestMejoras', 'user_1764043380994_yjhcp8h90', 'user', '2025-11-25 04:03:00', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(85, 'Prueba', 'user_1764046865785_8xo1gownz', 'user', '2025-11-25 05:01:05', NULL, 'manual', NULL, NULL, NULL, '2025-12-04 17:13:29'),
(320, 'Pablo Larios', 'session_1764869157_6931c42514a659.65016513', 'user', '2025-12-04 17:23:43', '$2y$10$qgjaba7obhO69rjdrvWrQOHPxnBD/fxNh/jy951ES5WExx7UTPpT2', 'manual', NULL, '', NULL, '2025-12-04 17:25:57'),
(321, 'Javier Rueda', 'session_1768759896_696d225824b063.68607880', 'user', '2025-12-04 18:11:39', NULL, 'google', '100929719587063927248', 'javier.rueda@esnmalaga.org', 'https://lh3.googleusercontent.com/a/ACg8ocIjYgU32q9ogP3dANwG0NPmSilh7Hue284F4dfULSZzk0TXUOw=s96-c', '2026-01-18 18:11:36'),
(322, 'BoqueronGAVI', 'session_1764872419_6931d0e3c36608.37730664', 'moderator', '2025-12-04 18:18:48', '$2y$10$obMA2WNaGb6Ib1zWbHaKPO7X93QHICVK2onkH8.hTGtFRJRom6lbu', 'manual', NULL, '', NULL, '2025-12-04 18:20:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contributions`
--
ALTER TABLE `contributions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item` (`item_type`,`item_id`),
  ADD KEY `idx_user` (`user_session`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_problem` (`problem_id`),
  ADD KEY `idx_proposal` (`proposal_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`session`);

--
-- Indexes for table `problems`
--
ALTER TABLE `problems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`user_session`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `problem_supporters`
--
ALTER TABLE `problem_supporters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_support` (`problem_id`,`user_session`),
  ADD KEY `idx_problem` (`problem_id`),
  ADD KEY `idx_session` (`user_session`);

--
-- Indexes for table `proposals`
--
ALTER TABLE `proposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`user_session`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `proposal_support`
--
ALTER TABLE `proposal_support`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_support` (`proposal_id`,`user_session`),
  ADD KEY `idx_proposal_support_proposal` (`proposal_id`),
  ADD KEY `idx_proposal_support_session` (`user_session`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session` (`session`),
  ADD UNIQUE KEY `idx_username_unique` (`username`),
  ADD KEY `idx_session` (`session`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_google_id` (`google_id`),
  ADD KEY `idx_login_method` (`login_method`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contributions`
--
ALTER TABLE `contributions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `problems`
--
ALTER TABLE `problems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `problem_supporters`
--
ALTER TABLE `problem_supporters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `proposals`
--
ALTER TABLE `proposals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `proposal_support`
--
ALTER TABLE `proposal_support`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=330;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `problem_supporters`
--
ALTER TABLE `problem_supporters`
  ADD CONSTRAINT `problem_supporters_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_support`
--
ALTER TABLE `proposal_support`
  ADD CONSTRAINT `proposal_support_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
