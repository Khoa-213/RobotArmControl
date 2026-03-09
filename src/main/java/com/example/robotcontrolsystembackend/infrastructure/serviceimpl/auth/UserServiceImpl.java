package com.example.robotcontrolsystembackend.infrastructure.serviceimpl.auth;

import com.example.robotcontrolsystembackend.application.dto.request.auth.CreateUserRequest;
import com.example.robotcontrolsystembackend.application.dto.request.auth.UpdateUserRequest;
import com.example.robotcontrolsystembackend.application.dto.request.auth.UpdateUserRoleRequest;
import com.example.robotcontrolsystembackend.application.dto.response.auth.UserResponse;
import com.example.robotcontrolsystembackend.application.service.auth.UserService;
import com.example.robotcontrolsystembackend.common.exception.AppException;
import com.example.robotcontrolsystembackend.common.exception.ErrorCode;
import com.example.robotcontrolsystembackend.common.response.PageResponse;
import com.example.robotcontrolsystembackend.domain.enumtype.UserRole;
import com.example.robotcontrolsystembackend.domain.enumtype.UserStatus;
import com.example.robotcontrolsystembackend.domain.model.User;
import com.example.robotcontrolsystembackend.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED, "Username already exists");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED, "Email already exists");
        }
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .userStatus(request.getStatus() != null ? request.getStatus() : UserStatus.Active)
                .build();
        
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + userId));
        return mapToResponse(user);
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(Pageable pageable, UserRole role, UserStatus status, String search) {
        Page<User> userPage = userRepository.findAllWithFilters(role, status, search, pageable);
        List<UserResponse> content = userPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.of(userPage, content);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + userId));
        
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USER_EXISTED, "Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED, "Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getPassword() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        if (request.getStatus() != null) {
            user.setUserStatus(request.getStatus());
        }
        
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + userId));
        
        user.setRole(request.getRole());
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + userId));
        
        user.setUserStatus(UserStatus.Inactive);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + userId));
        
        user.setUserStatus(UserStatus.Active);
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getUserStatus())
                .build();
    }
}
