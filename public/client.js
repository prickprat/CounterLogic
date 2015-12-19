(function(){

    function appendToCategoryList(categories) {
        var list = [];
        var content;

        $.each(categories, function(index, categoryName) {
            content = '<a href="/categories/' + categoryName.name + '">' + categoryName.name + '</a>' +
                        ' <a href="#" data-category-name="' + categoryName.name + '">' +
                        '<img class="deleteButton" src="delete.png"></a>' +
                        '<span class="counter"><span>Counter:</span><span>' + categoryName.count + '</span></span>';
            list.push($('<li>', { html: content }));
        })

        $('.category-list').append(list);
    }

    // Request all categories from server
    $.get('/categories', appendToCategoryList);

    // Creating a new category
    $('form').submit(function (event){
        event.preventDefault();

        var form = $(this);
        var categoryData = form.serialize();

        $('.alert').hide();

        $.post('/categories', categoryData)
            .done(function(categoryName) {
                appendToCategoryList([categoryName.name]);
                form.trigger('reset');
            })
            .fail(function() {
                $('.alert').show();
            });
    });

    // Deleting a block
    $('.category-list').on('click', 'a[data-category-name]', function (event){
        if(!confirm('Are you sure you want to delete?')) {
            return false;
        }

        var target = $(event.currentTarget);

        //Remove the block from the server and block list.
        $.ajax({
                type: 'DELETE',
                url: '/categories/' + target.data('categoryName')
            })
            .done(function (){
                target.parents('li').remove();
            });
    });
})();