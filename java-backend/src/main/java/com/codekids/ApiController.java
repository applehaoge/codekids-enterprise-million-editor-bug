package com.codekids;  // 确保包路径与主类一致

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping({"", "/"})  // ✅ 匹配 /api 和 /api/
    public String home() {
        return "Java Backend is working!";
    }
}
