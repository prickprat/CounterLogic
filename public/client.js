(function(){

    function appendToCategoryList(categories) {
        var list = [];
        var content;

        $.each(categories, function(index, categoryName) {
            content = '<a href="/categories/' + categoryName + '">' + categoryName + '</a>' +
                        ' <a href="#" data-categoryName="' + categoryName + '">' +
                        '<img class="deleteButton" src="delete.png"></a>';
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

        $.post('/categories', categoryData, function (categoryName){
            appendToCategoryList([categoryName]);
            form.trigger('reset');
        });
    });

    // Deleting a block
    $('.category-list').click('a[data-categoryName]', function (event){
        var target = $(event.currentTarget);

        if(!confirm('Are you sure you want to delete?')) {
            return false;
        }

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