package com.filesharing.repository;

import com.filesharing.model.FileAccess;
import com.filesharing.model.FileMetadata;
import com.filesharing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileAccessRepository extends JpaRepository<FileAccess, UUID> {
    List<FileAccess> findByFile(FileMetadata file);
    Optional<FileAccess> findByFileAndUser(FileMetadata file, User user);
    List<FileAccess> findByUser(User user);
}
