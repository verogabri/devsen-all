<?php

namespace DevSen\Gateway;

use PDO;
use PDOException;
use Monolog\Logger;

class DatabaseConnection
{
    private static ?PDO $instance = null;
    private static array $config = [];
    private static ?Logger $logger = null;

    public static function setConfig(array $config): void
    {
        self::$config = $config;
    }

    public static function setLogger(Logger $logger): void
    {
        self::$logger = $logger;
    }

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            try {
                $dsn = sprintf(
                    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                    self::$config['DB_HOST'],
                    self::$config['DB_PORT'],
                    self::$config['DB_NAME'],
                    self::$config['DB_CHARSET']
                );

                self::$instance = new PDO(
                    $dsn,
                    self::$config['DB_USERNAME'],
                    self::$config['DB_PASSWORD'],
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                    ]
                );

                if (self::$logger) {
                    self::$logger->info('Database connection established successfully');
                }
            } catch (PDOException $e) {
                if (self::$logger) {
                    self::$logger->error('Database connection failed: ' . $e->getMessage());
                }
                throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
            }
        }

        return self::$instance;
    }

    public static function closeConnection(): void
    {
        self::$instance = null;
        if (self::$logger) {
            self::$logger->info('Database connection closed');
        }
    }
}