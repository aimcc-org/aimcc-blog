package com.aimcc.blog.tools;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Scanner;

/**
 * 一次性小工具：把明文密码转成 BCrypt 密文，用于填 V3 迁移的 admin_user 表
 * 密码走控制台输入，不落代码、不进 git；以后改密码也能用它
 */
public class HashGenerator {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("== BCrypt 密文生成器（输入空行退出）==");
        while (true) {
            System.out.print("输入明文密码: ");
            String password = scanner.nextLine();
            if (password.isEmpty()) {
                break;
            }
            // 每次生成的密文都不一样（盐随机），但都能通过校验——这是特性不是 bug
            System.out.println("BCrypt 密文: " + encoder.encode(password));
            System.out.println();
        }
    }
}
