module CommentsHelper

  def comment_link_text(parent_id)
    parent_id.present? ? t("comments_helper.reply_link") : t("comments_helper.comment_link")
  end

  def comment_button_text(parent_id)
    parent_id.present?  ? t("comments_helper.reply_button") : t("comments_helper.comment_button")
  end

  def parent_or_commentable_dom_id(parent_id, commentable)
    parent_id.blank? ? dom_id(commentable) : "comment_#{parent_id}"
  end

  def child_comments_of(parent)
    if @comment_tree.present?
      @comment_tree.ordered_children_of(parent)
    else
      parent.children
    end
  end

  def user_level_class(comment)
    if comment.as_administrator?
      "is-admin"
    elsif comment.as_moderator?
      "is-moderator"
    elsif comment.user.official?
      "user-level-#{comment.user.official_level}"
    else
      "" # Default no special user class
    end
  end

  def comment_author_class(comment, author_id)
    if comment.user_id == author_id
      "comment-author"
    else
      "" # Default not author class
    end
  end

  def comment_class_names(comment, author)
    classes = ["comment", comment_alignment_class(comment.alignment),
               comment_author_class(comment, author.id)]
    classes.compact.join(" ")
  end

  def comment_alignment_class(alignment)
    return nil unless alignment
    return "negative" if alignment < 0
    return "neutral" if alignment == 0
    return "positive" if alignment > 0
  end
end
